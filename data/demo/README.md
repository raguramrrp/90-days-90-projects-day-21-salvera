# SALVERA Benchmark Demonstration Dataset

**Label:** DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY.

## Overview
This directory contains calibrated, statistically realistic demonstration data for SALVERA, spanning 21 technology roles across 7 Indian tech hubs (Chennai, Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Coimbatore).

## Files
- `salary_records.csv`: 5292 records with normalized compensation, experience, role categories, skills, and industry attribution.
- `job_roles.csv`: Standardized technology role taxonomy and categories.
- `skills.csv`: Skill dictionary categorized by domain.
- `locations.csv`: City metadata with Tier classification and cost-of-living index.
- `role_skills.csv`: Empirical skill co-occurrence frequencies per role.
- `dataset_metadata.json`: Dataset provenance, license, and calibration metadata.

## Provenance & Disclaimer
All records in this dataset carry `is_synthetic = true`. They are generated via log-normal multi-factor compensation distributions reflecting real-world market spreads, designed for offline local execution, algorithm benchmarking, and end-to-end user workflows without requiring external paid APIs.
