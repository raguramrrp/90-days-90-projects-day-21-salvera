# SALVERA — Testing Strategy & Verification Report

## 1. Test Overview

Automated tests cover all critical services, financial formulas, machine learning inference, and document export engines:

| Test Module | Coverage Areas | Verification Status |
|---|---|---|
| `test_normalization_direct_inr` | Direct annual INR preservation | **PASS** |
| `test_normalization_monthly_inr` | Monthly to annual INR conversion (12x) | **PASS** |
| `test_normalization_usd` | USD currency exchange rate normalization (83.5x) | **PASS** |
| `test_inr_formatting` | LPA and Indian comma numbering formatting | **PASS** |
| `test_salary_analytics_summary` | Median, Mean, P25, P75, IQR calculation | **PASS** |
| `test_salary_distribution_bins` | Histogram equal-interval binning | **PASS** |
| `test_salary_by_experience` | Experience cohort salary progression | **PASS** |
| `test_skill_rankings` | Skill frequency counts and percentage calculation | **PASS** |
| `test_skill_comparison` | Multi-profile skill subset matching | **PASS** |
| `test_role_service` | Standardized role catalog queries & detail retrieval | **PASS** |
| `test_location_service` | Indian city metadata, COL indices, tier metrics | **PASS** |
| `test_offer_studio_financial_decomposition` | Stated CTC vs Take-Home vs Disposable income | **PASS** |
| `test_career_planner_gap_analysis` | Empirical role-skill gap categorization | **PASS** |
| `test_ml_salary_predictor` | Scikit-learn inference, 90% confidence bounds, explainability | **PASS** |
| `test_dataset_quality_metrics` | Composite hygiene score, IQR outlier calculation | **PASS** |
| `test_pdf_generators` | ReportLab PDF buffer generation and magic bytes (`%PDF`) | **PASS** |

**Pytest Execution Command:**
```cmd
test.bat
```
**Actual Result:** 16 passed in 5.65 seconds. Zero failures.

---

## 2. End-to-End Build & Run Verification

- **Backend API Startup Check:** Verified by probing `http://127.0.0.1:8000/api/overview/summary` via PowerShell. Returned HTTP 200 with 2,250 records and live metrics.
- **Frontend Production Build:** Executed `npm run build`. TypeScript compiler and Vite bundler completed in 1.63 seconds with 0 errors.
