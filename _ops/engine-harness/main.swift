import Foundation
import CoreGraphics

// JSON lines in, JSON lines out. kind "sheet": page-1 packing of many copies of one size.
// kind "quality": PrintQuality for a photo at a size (fill or fit, centred crop).
struct Case: Codable {
    let kind: String
    var w: Double = 0; var h: Double = 0
    var paper: String? = nil; var orientation: String? = nil
    var margin: Double = 0; var spacing: Double = 0
    var rotates: Bool = true; var centers: Bool = false
    var px: Double = 0; var py: Double = 0; var fill: Bool = true
}
struct Cell: Codable { let x: Double; let y: Double; let w: Double; let h: Double; let r: Bool }
struct SheetOut: Codable { let count: Int; let cells: [Cell]; let fits: Bool; let filler: Int }
struct QualityOut: Codable { let ppi: Double; let rating: String; let sx: Double; let sy: Double; let sw: Double; let sh: Double; let l300w: Double?; let l300h: Double?; let l200w: Double?; let l200h: Double? }

let decoder = JSONDecoder(); let encoder = JSONEncoder()
while let line = readLine() {
    let c = try! decoder.decode(Case.self, from: Data(line.utf8))
    if c.kind == "sheet" {
        let size = PhysicalSize(width: c.w, height: c.h)
        var doc = LayoutDocument(paper: PaperSize(rawValue: c.paper!)!, orientation: PageOrientation(rawValue: c.orientation!)!,
                                 margin: c.margin, spacing: c.spacing, rotatesToFit: c.rotates, centersOnPage: c.centers)
        // Enough copies to overflow one page (area bound + 2), so page 1 shows the sheet's capacity.
        let room = doc.contentRect.width * doc.contentRect.height
        let copies = max(1, min(20000, Int(room / max(size.area, 1)) + 2))
        doc.placements = [PhotoPlacement(assetID: UUID(), size: size, copies: copies)]
        let result = LayoutEngine.layout(doc)
        let cells = result.pages.first?.cells.map { Cell(x: $0.frame.minX, y: $0.frame.minY, w: $0.frame.width, h: $0.frame.height, r: $0.isRotated) } ?? []
        // Cross-check with the app's own "fill the sheet" path (capped at 50 copies).
        var one = doc; one.placements[0].copies = 1
        let filler = result.unplaced.isEmpty ? SheetFiller.additionalCopies(of: one.placements[0].id, in: one) + 1 : 0
        print(String(data: try! encoder.encode(SheetOut(count: cells.count, cells: cells, fits: result.unplaced.isEmpty, filler: filler)), encoding: .utf8)!)
    } else {
        let placement = PhotoPlacement(assetID: UUID(), size: PhysicalSize(width: c.w, height: c.h), copies: 1, mode: c.fill ? .fill : .fit)
        let q = PrintQuality.evaluate(imageSize: CGSize(width: c.px, height: c.py), placement: placement)
        let src = CropMath.visibleSourceRect(imageSize: CGSize(width: c.px, height: c.py), cellSize: placement.size.cgSize, mode: placement.mode, crop: placement.crop)
        let l3 = PrintQuality.largestSize(of: placement.size, quality: q, atPixelsPerInch: 300).map(PrintQuality.roundedDown)
        let l2 = PrintQuality.largestSize(of: placement.size, quality: q, atPixelsPerInch: 200).map(PrintQuality.roundedDown)
        print(String(data: try! encoder.encode(QualityOut(ppi: q.pixelsPerInch, rating: q.rating.rawValue, sx: src.minX, sy: src.minY, sw: src.width, sh: src.height, l300w: l3?.width, l300h: l3?.height, l200w: l2?.width, l200h: l2?.height)), encoding: .utf8)!)
    }
}
