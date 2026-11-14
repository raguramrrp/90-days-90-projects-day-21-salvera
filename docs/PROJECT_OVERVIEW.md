# SALVERA — Project Overview

**Professional Title:** Technology Salary & Career Intelligence Platform  
**Product Category:** CareerTech / Data Analytics / Business Intelligence  
**Tagline:** Understand your market value. Make smarter career moves.  

---

## 1. Executive Summary & Problem Statement

Traditional compensation platforms (Glassdoor, AmbitionBox, Payscale) primarily display flat average salaries. However, compensation in the modern technology ecosystem is multi-dimensional:
1. **Misleading Averages:** Fixed averages conceal wide spreads between 25th, 50th, and 75th percentiles.
2. **False Causality:** Generic tools often claim that learning a skill directly inflates salary, ignoring role seniority, industry margins, and location premiums.
3. **CTC Confusion:** Recruiters routinely market inflated Cost-to-Company (CTC) figures containing one-time joining bonuses, non-cash perks, and deferred equity, leaving job seekers surprised by modest monthly take-home pay.
4. **Lack of Gap Actionability:** Knowing a target role's salary does not inform a candidate of the exact empirical skill milestones required to qualify for that band.

**SALVERA** solves these problems by providing an editorial-grade career and compensation intelligence platform that helps students, job seekers, and technology professionals explore actual distributions, evaluate multi-skill portfolios, deconstruct job offers, estimate compensation with trained regression models, and generate actionable learning roadmaps.

---

## 2. Core Value Propositions

- **Empirical Percentile Analytics:** Inspect true medians, IQRs, and min/max boundaries across 21 standardized tech roles in 7 Indian tech hubs.
- **Strict Information Separation:** SALVERA enforces an unwavering boundary between *observed survey records*, *statistical associations*, *machine learning predictions*, and *user-entered parameters*.
- **Offer Studio Financial Decomposition:** Distinguishes fixed base, variable bonus, one-time cash, statutory tax deductions, and city living expenses (rent, commute) to compute **Net Monthly Disposable Surplus**.
- **Scikit-Learn ML Salary Regressor:** Pipeline-based inference with ColumnTransformer, multi-hot skill encoding, 90% prediction intervals, and cross-model benchmarks (Gradient Boosting R² = 85.5%).
- **Interactive Career Skill-Gap Engine:** Compares a candidate's current capabilities against empirical role frequencies to construct an actionable, printable roadmap.
- **Zero-Friction Offline Execution:** Ships with a calibrated 2,250-record synthetic benchmark corpus, SQLite/PostgreSQL persistence, and local automated Windows batch scripts.

---

## 3. Target User Personas

| Persona | Primary Needs & Workflows |
|---|---|
| **College Students & Fresh Graduates** | Benchmark realistic entry-level packages, explore skill requirements for target roles (e.g. Data Analyst vs Data Scientist), and build learning plans. |
| **Technology Professionals (1-7 Yrs Exp)** | Evaluate market worth, compare job offers, and analyze compensation lift associated with complementary skills (e.g. Python + PyTorch + MLOps). |
| **Career Switchers** | Identify transferable skills and prioritize high-frequency technical gaps to transition into AI/ML or Cloud engineering. |
| **Recruiters & Compensation Analysts** | Benchmark realistic salary bands across Indian tech hubs (Bengaluru, Chennai, Hyderabad, Pune, Mumbai, Delhi NCR). |
