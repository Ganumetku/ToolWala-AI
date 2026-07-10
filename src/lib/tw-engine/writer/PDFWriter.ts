import { TWDocument } from '../types';
import { IndirectObject } from './IndirectObject';
import { ObjectSerializer } from './ObjectSerializer';
import { PageSerializer } from './PageSerializer';
import { StreamWriter } from './StreamWriter';
import { XRefBuilder } from './XRefBuilder';
import { TrailerBuilder } from './TrailerBuilder';
import { PDFName } from './WriterTypes';

/**
 * PDFWriter acts as the main entry point to compile TWDocument models
 * into valid standard-compliant PDF byte streams.
 */
export class PDFWriter {
  /**
   * Translates a TWDocument tree and outputs the final PDF binary ArrayBuffer.
   */
  static writeDocument(doc: TWDocument): Uint8Array {
    const objects: IndirectObject[] = [];
    let nextObjNum = 1;

    // 1. Create Catalog Object
    const catalog = new IndirectObject(nextObjNum++);
    catalog.dictionary.Type = new PDFName('Catalog');
    objects.push(catalog);

    // 2. Create Pages Object parent
    const pagesNode = new IndirectObject(nextObjNum++);
    pagesNode.dictionary.Type = new PDFName('Pages');
    objects.push(pagesNode);
    catalog.dictionary.Pages = {
      type: 'reference',
      objNum: pagesNode.objNum,
      genNum: 0,
    } as any;

    // 3. Create Info Dictionary Metadata
    const info = new IndirectObject(nextObjNum++);
    info.dictionary.Creator = 'ToolWala PDF SDK';
    info.dictionary.Title = doc.fileName || 'ToolWala Document';
    info.dictionary.Producer = 'ToolWala Native PDF Writer Engine';
    info.dictionary.CreationDate = 'D:20260710080000Z'; // Fixed date format
    objects.push(info);

    // 4. Create Core Font Objects
    const f1 = new IndirectObject(nextObjNum++);
    f1.dictionary.Type = new PDFName('Font');
    f1.dictionary.Subtype = new PDFName('Type1');
    f1.dictionary.BaseFont = new PDFName('Helvetica');
    f1.dictionary.Encoding = new PDFName('MacRomanEncoding');
    objects.push(f1);

    const f2 = new IndirectObject(nextObjNum++);
    f2.dictionary.Type = new PDFName('Font');
    f2.dictionary.Subtype = new PDFName('Type1');
    f2.dictionary.BaseFont = new PDFName('Helvetica-Bold');
    f2.dictionary.Encoding = new PDFName('MacRomanEncoding');
    objects.push(f2);

    const fontRefs = {
      F1: { type: 'reference', objNum: f1.objNum, genNum: 0 },
      F2: { type: 'reference', objNum: f2.objNum, genNum: 0 },
    };

    const kidsRefs: any[] = [];

    // 5. Serialize Pages and Contents streams
    doc.pages.forEach((page) => {
      const pageObj = new IndirectObject(nextObjNum++);
      pageObj.dictionary.Type = new PDFName('Page');
      pageObj.dictionary.Parent = {
        type: 'reference',
        objNum: pagesNode.objNum,
        genNum: 0,
      } as any;
      pageObj.dictionary.MediaBox = [0, 0, page.width, page.height];
      objects.push(pageObj);
      kidsRefs.push({
        type: 'reference',
        objNum: pageObj.objNum,
        genNum: 0,
      });

      // Generate page content stream
      const contentBytes = PageSerializer.generateContentsStream(page);
      const streamRes = StreamWriter.writeStream(contentBytes, true);

      const contentObj = new IndirectObject(nextObjNum++);
      contentObj.dictionary = streamRes.dict;
      contentObj.stream = streamRes.streamBytes;
      objects.push(contentObj);
      pageObj.dictionary.Contents = {
        type: 'reference',
        objNum: contentObj.objNum,
        genNum: 0,
      } as any;

      // Compile resources dictionary
      const resourcesDict: Record<string, any> = {
        Font: { ...fontRefs },
      };

      // Add image resources (if any)
      const imagesOnPage = page.objects.filter((o) => o.type === 'image' && !o.deleted);
      if (imagesOnPage.length > 0) {
        const xobjectDict: Record<string, any> = {};

        imagesOnPage.forEach((imgObj: any) => {
          if (imgObj.imageBytes) {
            const imgRef = `Im${imgObj.id.replace(/[^a-zA-Z0-9]/g, '')}`;

            const imgXObj = new IndirectObject(nextObjNum++);
            imgXObj.dictionary.Type = new PDFName('XObject');
            imgXObj.dictionary.Subtype = new PDFName('Image');
            imgXObj.dictionary.Width = imgObj.width;
            imgXObj.dictionary.Height = imgObj.height;
            imgXObj.dictionary.ColorSpace = new PDFName('DeviceRGB');
            imgXObj.dictionary.BitsPerComponent = 8;

            const compressedImage = StreamWriter.writeStream(imgObj.imageBytes, true);
            imgXObj.dictionary = {
              ...imgXObj.dictionary,
              ...compressedImage.dict,
            };
            imgXObj.stream = compressedImage.streamBytes;
            objects.push(imgXObj);

            xobjectDict[imgRef] = {
              type: 'reference',
              objNum: imgXObj.objNum,
              genNum: 0,
            };
          }
        });

        resourcesDict.XObject = xobjectDict;
      }

      pageObj.dictionary.Resources = resourcesDict;
    });

    pagesNode.dictionary.Kids = kidsRefs;
    pagesNode.dictionary.Count = kidsRefs.length;

    // 6. Output PDF binary streams
    const chunks: Uint8Array[] = [];
    const encoder = new TextEncoder();

    // Write PDF Header (standard 1.7 header + binary content indicators)
    const headerBytes = encoder.encode('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n');
    chunks.push(headerBytes);
    let currentOffset = headerBytes.length;

    // Serialize indirect objects
    objects.forEach((obj) => {
      obj.offset = currentOffset;

      const head = encoder.encode(`${obj.objNum} ${obj.genNum} obj\n`);
      const bodyStr = ObjectSerializer.serialize(obj.dictionary) + '\n';
      const body = encoder.encode(bodyStr);

      chunks.push(head);
      chunks.push(body);
      currentOffset += head.length + body.length;

      if (obj.stream) {
        const streamHead = encoder.encode('stream\n');
        const streamEnd = encoder.encode('\nendstream\n');
        chunks.push(streamHead);
        chunks.push(obj.stream);
        chunks.push(streamEnd);
        currentOffset += streamHead.length + obj.stream.length + streamEnd.length;
      }

      const endobj = encoder.encode('endobj\n');
      chunks.push(endobj);
      currentOffset += endobj.length;
    });

    // 7. Write XRef offsets
    const startXRef = currentOffset;
    const xrefRes = XRefBuilder.buildXRef(objects);
    chunks.push(xrefRes.bytes);
    currentOffset += xrefRes.bytes.length;

    // 8. Write trailer and EOF footer
    const trailerStr = TrailerBuilder.buildTrailer(
      objects.length + 1,
      catalog.objNum,
      info.objNum
    );
    const trailer = encoder.encode(trailerStr);
    chunks.push(trailer);

    const footer = encoder.encode(`startxref\n${startXRef}\n%%EOF\n`);
    chunks.push(footer);

    // Merge binary chunks into one flat array buffer
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Uint8Array(totalLength);
    let pos = 0;
    chunks.forEach((chunk) => {
      result.set(chunk, pos);
      pos += chunk.length;
    });

    return result;
  }
}
