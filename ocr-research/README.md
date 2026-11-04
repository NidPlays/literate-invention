# Free & open-source OCR for receipts, invoices and client documents

_Research notes, November 2026. Scope: OCR only for now (turn scans/photos/PDFs into text).
Analysis and categorisation come later, for example with Claude._

## TL;DR: what to use

| Situation | Pick | Why |
|---|---|---|
| **Default starting point** (CPU, mixed documents, output feeds an LLM later) | **Docling** (MIT) using its built-in OCR engine (RapidOCR/ONNX, or Tesseract) | One tool for PDFs, images, DOCX. Outputs clean **Markdown/JSON with tables and layout**, which is the best input for Claude later. `pip install docling`. |
| **Receipts and phone photos** (crumpled, skewed, thermal print) | **PaddleOCR** (Apache-2.0), PP-OCRv5 pipeline | Most accurate classic OCR engine for receipts in 2026 comparisons. Runs on CPU. |
| **Best accuracy, you have a GPU** (≈4–8 GB VRAM) | **PaddleOCR-VL** (~0.9B) or **MinerU** / **GLM-OCR** | Small vision-language "document parsers" at the top of OmniDocBench v1.6 (~95–96%). Read tables, stamps and handwriting much better than classic OCR. |
| **Just make scanned PDFs searchable** (archive) | **OCRmyPDF** (MPL-2.0, uses Tesseract) | Adds a text layer to PDFs in place. One command, very reliable. |
| **Want a ready-made app, not code** | **Paperless-ngx** (GPL-3.0, self-hosted) | Web UI: upload/email/scan documents, auto-OCR (OCRmyPDF), tags, correspondents, full-text search. Already does basic auto-categorisation. |

**Suggested path:** start with **Docling** (or Paperless-ngx if you'd rather have a UI) and save the Markdown/JSON
for each document. If receipts come out badly, send just the receipts through **PaddleOCR**, or **PaddleOCR-VL** if you have a GPU.
Later, pass the saved text, or the original image, to Claude to pull out vendor, date, totals and tax and to assign a category.

## The options in more detail

### Classic OCR engines (find text, read characters)
- **Tesseract** (Apache-2.0): the long-standing standard. Fast, runs on CPU, 100+ languages. Good on clean scans and
  digital-looking invoices. Weak on photos, skew, low contrast and receipts. In one small 2026 invoice test it got 87.5% vs PaddleOCR's 100%.
- **PaddleOCR / PP-OCRv5** (Apache-2.0): the most accurate free classic engine in most 2026 comparisons, and clearly
  better than EasyOCR on receipt datasets (SROIE, CORD). Includes layout/table modules (PP-Structure).
- **docTR** (Apache-2.0, Mindee): clean Python API, PyTorch. Good accuracy, simple end-to-end pipeline.
- **EasyOCR** (Apache-2.0): easy to install, but lowest accuracy of this group on receipts. Not recommended.
- **RapidOCR** (Apache-2.0): PaddleOCR models exported to ONNX. Light and fast, and it's Docling's default engine.

### Document-parsing pipelines (layout, tables and reading order, not just text)
- **Docling** (MIT, IBM / LF AI): converts PDF, images, DOCX, etc. to Markdown/JSON. Pluggable OCR engines
  (RapidOCR, Tesseract, EasyOCR) and an optional VLM mode. Licence is fine for commercial use. It can be slow on large batches.
- **Marker / Surya** (Datalab): very good PDF→Markdown. ⚠️ **Licence check:** the code is open, but the
  model weights are under a modified OpenRAIL-M licence that is free only below a revenue/funding threshold. Above it you need a paid licence.
- **MinerU** (OpenDataLab): strong PDF/table parsing. Previously AGPL-3.0. Reportedly moved to a custom
  Apache-based licence in v3.1 (April 2026). Check the LICENSE file before using it commercially.

### Small OCR vision-language models (best accuracy, GPU recommended)
In 2026, dedicated ~1B-parameter document VLMs lead the open-source rankings on OmniDocBench v1.6:
PaddleOCR-VL-1.6 ≈ 96.3, MinerU2.5-Pro ≈ 95.8, GLM-OCR ≈ 95.2. Large general VLMs (Qwen3-VL etc.) score lower
on pure document parsing but can answer questions about a document. Other models worth knowing: olmOCR (Allen AI), Chandra OCR,
dots.ocr, DeepSeek-OCR. Run them via vLLM or Transformers. CPU is possible, but slow.

## Practical notes for receipts and invoices
- **Image quality matters more than the engine choice.** Deskew, crop and increase contrast on phone photos first.
  Many tools do this already; OpenCV can if not.
- **Digital PDFs often need no OCR.** Invoices emailed as PDFs usually already contain text. Extract it directly
  (Docling/pdfplumber/PyMuPDF do this automatically) and only OCR scanned pages.
- **Keep the layout.** Totals, tax lines and line-item tables are much easier for an LLM to read when the OCR
  output keeps structure (Markdown tables / JSON with coordinates) rather than flat text.
- **Store the original file next to the OCR text.** When you add Claude later, you can send the image itself
  as well as or instead of the OCR text. Claude reads receipts directly, which helps when the OCR is poor.
- **Privacy:** every option above runs fully locally, so client documents never leave your machine at the OCR stage.

## Quick start (Docling)
```bash
pip install docling
docling ./client_docs/ --to md --to json --output ./ocr_out/
```
Or for receipts with PaddleOCR:
```bash
pip install paddlepaddle paddleocr
paddleocr ocr -i receipt.jpg
```
(Check each project's README for the current CLI flags. These change between releases.)

## Before committing
1. Collect ~20 real samples (good scans, phone photos of receipts, multi-page invoices, any non-English).
2. Run Docling, PaddleOCR, and PaddleOCR-VL (if GPU) on them, and compare totals, dates and vendor names by hand.
3. Pick the simplest tool that gets the important fields right.

Licences were checked from public sources in Nov 2026. Re-verify the LICENSE file of whichever tool you adopt.

## Sources
- Roboflow, Best open-source OCR models (2026): https://blog.roboflow.com/best-open-source-ocr-models/
- Unstract, Best open-source OCR tools 2026: https://unstract.com/blog/best-opensource-ocr-tools/
- PaddleOCR vs EasyOCR receipt benchmark: https://imagetotable.ai/references/paddleocr-vs-easyocr-receipt-benchmark
- Codesota, OCR in Python: https://codesota.com/ocr/best-for-python
- VLM OCR locally for invoices (OmniDocBench versions): https://wz-it.com/blog/vision-language-modelle-ocr-lokal/
- Docling model catalog: https://docling-project.github.io/docling/usage/model_catalog
- Docling/Marker for invoices: https://invoicedataextraction.com/blog/docling-marker-llamaparse-invoice-extraction
- Surya model card (licence): https://huggingface.co/datalab-to/surya-ocr-2
- MinerU licence change: https://trending8.vercel.app/repo/opendatalab/MinerU
