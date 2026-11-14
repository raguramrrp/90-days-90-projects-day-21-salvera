# SALVERA — End-to-End User Guide

This guide walks you through every feature of SALVERA, detailing analytical controls, filters, calculations, and exports.

---

## 1. Market Overview (`/overview`)

- **Hero Search Bar:** Enter a target role (e.g. *Data Analyst*) and location (e.g. *Chennai*) to instantly filter matching database records.
- **Top Metrics:** Review database volume, standardized roles, and 50th percentile median annual compensation.
- **Visual Charts:**
  - *Salary Distribution:* Inspect the histogram of observed packages in Lakhs Per Annum (LPA).
  - *Experience Curve:* Track the median and 75th percentile salary progression across career brackets (0-2y, 2-5y, 5-8y, 8-12y, 12+y).
- **Factual Data Insights:** Read empirical observations mined from the database (e.g. SQL prevalence, PyTorch premiums).

---

## 2. Salary Explorer (`/salary-explorer`)

- **Multi-Factor Filter Toolbar:**
  - Filter by Role, City, Industry, Employment Mode, and Min/Max Experience.
  - Dependent charts and granular table rows automatically refresh.
- **Statistical Summary Grid:**
  - Displays Sample Count ($N$), Median, Mean, 25th Percentile, 75th Percentile, Min, and Max.
  - Automatically displays a sample reliability warning if matching records $N < 25$.
- **Granular Records Table:**
  - View individual postings, original currency, compensation period, and normalized annual INR.
  - Sort by salary or experience, paginate, or click **Export CSV** to download raw records.

---

## 3. Skill Intelligence (`/skills`)

- **Skill Search & Leaderboard:**
  - Filter skills by domain (Programming, Machine Learning, Cloud & DevOps, Database & Query).
  - Inspect prevalence count, percentage of records, and median compensation.
- **Multi-Profile Skill Comparison Studio:**
  - Enter skills for **Profile A** (e.g. `[Python]`) and **Profile B** (e.g. `[Python, SQL, AWS]`).
  - Click **Compare Portfolios** to view matching record counts, median salaries, and IQR spreads.
- **Frequent Itemset Bundles:**
  - Review technical skill pairs that commonly co-occur with their associated relative salary lift.

---

## 4. Role Explorer (`/roles`)

- **Role Directory Cards:** Inspect canonical title, description, typical experience, and top skills.
- **Side-by-Side Matrix Comparison:**
  - Select up to 4 roles (e.g. *Data Analyst*, *Business Analyst*, *Data Scientist*, *Data Engineer*).
  - Compare interquartile bands, experience spreads, and core requirements in a single view.
- **Inspect Role Profile:** Click to open a modal detailing empirical skill frequency distributions and top hiring cities.

---

## 5. Location Intelligence (`/locations`)

- **Indian Tech Hubs Directory:** Review Bengaluru, Hyderabad, Pune, Chennai, Mumbai, Delhi NCR, and Coimbatore.
- **Cost-of-Living (COL) Context:** Review benchmark cost indices relative to a 100-baseline alongside salary medians.
- **City Comparison Studio:** Compare up to 4 cities side-by-side to understand geographic compensation differentials.

---

## 6. Offer Comparison Studio (`/offer-studio`)

- **Enter Job Offers:**
  - Input Company Name, Role, Location, Work Mode, Fixed Base, Variable Bonus, One-Time Joining Bonus, and Annual Perks.
  - Enter expected monthly tax/PF deductions and city living expenses (rent, commute, overhead).
- **Decomposition Calculations:**
  1. *Total Stated CTC:* Full employer commitment.
  2. *Recurring Gross Annual:* Sustainable annual income excluding one-time joining bonuses.
  3. *Estimated Monthly Take-Home:* Cash in-hand after statutory deductions.
  4. *Estimated Monthly Disposable Surplus:* Actual purchasing power after paying rent and commute.
- **Exports:**
  - Click **Export Official PDF** to generate an executive compensation evaluation sheet via ReportLab.
  - Click **Export CSV** for spreadsheet analysis.

---

## 7. Machine Learning Salary Estimator (`/salary-estimator`)

- **Input Profile:** Select Role, Experience slider (0-15 years), City, Industry, and Technical Skills.
- **Run Estimation:**
  - Generates predicted annual salary and monthly equivalent.
  - Displays a **90% Statistical Prediction Interval** (lower bound to upper bound).
  - Displays **Feature Importance Weights** showing which factors added value.
- **Cross-Validation Benchmarks Table:**
  - Compare performance of Linear Regression, Random Forest, and Gradient Boosting (MAE, RMSE, R²).

---

## 8. Career Planner (`/career-planner`)

- **Audit Target Role:** Enter your current role, select target role, set target date, and input current skills.
- **Skill Gap Categorization:**
  - *Current Strengths:* Skills already acquired.
  - *Core Gaps:* High-frequency skills required by 75%+ of postings.
  - *Recommended Additions:* Valuable complementary tools.
  - *Advanced Specializations:* Production-grade depth.
- **Roadmap Milestones:**
  - Click milestone status icons to toggle between `Planned`, `In Progress`, and `Completed`.
  - Add custom milestones or delete skills.
  - Click **Export Career Plan PDF** to download a structured, printable career plan.

---

## 9. Market Watch (`/market-watch`)

- **Follow Items:** Add target roles, skills, or cities to your personal tracking board.
- **Differential Tracking:** Monitor current market medians against baseline snapshots.
- **Platform Activity Feed:** Review verified events (dataset ingestion, model version updates).

---

## 10. Data & Insights Centre (`/data-insights`)

- **Data Hygiene Audit:** Review composite quality score, missing-field percentages, duplicate counts, and outlier reviews.
- **Provenance Registry:** Verify dataset origin, license (CC-BY 4.0), and synthetic disclosure.
- **CSV Ingestion:** Upload custom salary CSV files with immediate schema validation.
