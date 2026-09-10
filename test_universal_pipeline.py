import asyncio
import os
import sys

# Set PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.app.services.analysis_service import analyze_report

async def test():
    print("Testing CBC Report...")
    cbc_text = """
    Patient: Demo Patient
    Hemoglobin 10.8 g/dL Reference Range: 13.0 - 17.0
    WBC 11.2 x10^3/uL Reference: 4.5 - 11.0
    Platelets 210 x10^3/uL Range: 150 - 400
    """
    cbc_res = await analyze_report(inline_text=cbc_text)
    print("CBC Document Type:", cbc_res.get("document_type"))
    print("CBC Findings:", len(cbc_res.get("findings", [])))
    print("CBC Sections:", set(f.get("section") for f in cbc_res.get("findings", [])))

    print("\nTesting Lipid Profile (Non-CBC Format)...")
    lipid_text = """
    Test Description         Result   Unit    Ref
    Total Cholesterol        240      mg/dL   < 200
    Triglycerides            160      mg/dL   < 150
    HDL Cholesterol          45       mg/dL   > 40
    LDL Cholesterol          163      mg/dL   < 100
    """
    lipid_res = await analyze_report(inline_text=lipid_text)
    print("Lipid Document Type:", lipid_res.get("document_type"))
    print("Lipid Findings:", len(lipid_res.get("findings", [])))
    print("Lipid Sections:", set(f.get("section") for f in lipid_res.get("findings", [])))

if __name__ == "__main__":
    asyncio.run(test())
