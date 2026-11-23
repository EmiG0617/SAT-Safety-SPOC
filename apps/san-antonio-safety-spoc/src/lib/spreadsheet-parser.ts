export type SpreadsheetCell = string;
export type SpreadsheetRow = SpreadsheetCell[];

const textDecoder = new TextDecoder('utf-8');

const readUint16 = (view: DataView, offset: number): number => view.getUint16(offset, true);
const readUint32 = (view: DataView, offset: number): number => view.getUint32(offset, true);

const inflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const extractZipEntries = async (buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> => {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let endOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65_557); offset -= 1) {
    if (readUint32(view, offset) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('This file is not a valid Excel workbook.');

  const entryCount = readUint16(view, endOffset + 10);
  let directoryOffset = readUint32(view, endOffset + 16);
  const entries = new Map<string, Uint8Array>();

  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    if (readUint32(view, directoryOffset) !== 0x02014b50) throw new Error('The workbook directory is invalid.');
    const method = readUint16(view, directoryOffset + 10);
    const compressedSize = readUint32(view, directoryOffset + 20);
    const fileNameLength = readUint16(view, directoryOffset + 28);
    const extraLength = readUint16(view, directoryOffset + 30);
    const commentLength = readUint16(view, directoryOffset + 32);
    const localOffset = readUint32(view, directoryOffset + 42);
    const fileName = textDecoder.decode(bytes.slice(directoryOffset + 46, directoryOffset + 46 + fileNameLength));

    if (!fileName.endsWith('/')) {
      if (readUint32(view, localOffset) !== 0x04034b50) throw new Error('A workbook entry is invalid.');
      const localNameLength = readUint16(view, localOffset + 26);
      const localExtraLength = readUint16(view, localOffset + 28);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
      if (method === 0) entries.set(fileName, compressed);
      else if (method === 8) entries.set(fileName, await inflateRaw(compressed));
      else throw new Error('This workbook uses an unsupported compression method.');
    }
    directoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
};

const getXml = (entries: Map<string, Uint8Array>, path: string): Document | undefined => {
  const entry = entries.get(path);
  if (!entry) return undefined;
  const document = new DOMParser().parseFromString(textDecoder.decode(entry), 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The workbook contains invalid worksheet data.');
  return document;
};

const columnIndex = (reference: string): number => {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? 'A';
  return [...letters].reduce((total: number, letter: string) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

export const parseExcelWorkbook = async (buffer: ArrayBuffer): Promise<SpreadsheetRow[]> => {
  const entries = await extractZipEntries(buffer);
  const sharedDocument = getXml(entries, 'xl/sharedStrings.xml');
  const sharedStrings = sharedDocument
    ? Array.from(sharedDocument.getElementsByTagName('si')).map((item: Element) =>
        Array.from(item.getElementsByTagName('t')).map((text: Element) => text.textContent ?? '').join(''),
      )
    : [];

  const workbook = getXml(entries, 'xl/workbook.xml');
  const relationships = getXml(entries, 'xl/_rels/workbook.xml.rels');
  const firstSheet = workbook?.getElementsByTagName('sheet')[0];
  const relationshipId = firstSheet?.getAttribute('r:id');
  const relationship = relationships
    ? Array.from(relationships.getElementsByTagName('Relationship')).find((item: Element) => item.getAttribute('Id') === relationshipId)
    : undefined;
  const target = relationship?.getAttribute('Target') ?? 'worksheets/sheet1.xml';
  const normalizedTarget = target.replace(/^\/?xl\//, '').replace(/^\//, '');
  const worksheet = getXml(entries, `xl/${normalizedTarget}`);
  if (!worksheet) throw new Error('No readable worksheet was found in the workbook.');

  return Array.from(worksheet.getElementsByTagName('row')).map((row: Element): SpreadsheetRow => {
    const values: SpreadsheetRow = [];
    Array.from(row.getElementsByTagName('c')).forEach((cell: Element) => {
      const index = columnIndex(cell.getAttribute('r') ?? 'A1');
      const type = cell.getAttribute('t');
      const raw = cell.getElementsByTagName('v')[0]?.textContent ?? '';
      const inlineText = Array.from(cell.getElementsByTagName('t')).map((item: Element) => item.textContent ?? '').join('');
      values[index] = type === 's' ? sharedStrings[Number(raw)] ?? '' : type === 'inlineStr' ? inlineText : raw;
    });
    return values.map((value: string | undefined) => value ?? '');
  });
};

const parseCsvLine = (line: string): SpreadsheetRow => {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else current += character;
  }
  cells.push(current.trim());
  return cells;
};

export const parseCsv = (content: string): SpreadsheetRow[] =>
  content.split(/\r?\n/).filter((line: string) => line.trim().length > 0).map(parseCsvLine);
