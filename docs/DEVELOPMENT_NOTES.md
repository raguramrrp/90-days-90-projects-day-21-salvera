# SALVERA — Engineering & Development Notes

## 1. Technical Decisions & Design Philosophy

### Editorial Analytics Aesthetic
Rather than using generic SaaS dashboard kits, SALVERA adopts an editorial financial research style:
- Restrained, muted color palette (`#F6F7F5` background, `#286B59` deep forest green, `#A5B8AC` sage slate, `#E3E7E3` subtle borders).
- High-density typography with clear hierarchy (no oversized cards or decorative emoji icons).
- **Strict Horizontal Navigation:** No left sidebar at any breakpoint. Desktop layouts utilize full screen width for multi-column analytical tables and charts.

### Synthetic Data Generation Methodology
The synthetic dataset generator (`backend/scripts/generate_demo_data.py`) calibrates 2,250 records across 21 technology roles using multi-factor log-normal distributions:
- Base salaries calibrated across Indian tech hubs (Chennai baseline, Bengaluru +16%, Mumbai +12%, Hyderabad +6%, Pune +3%, Coimbatore -15%).
- Nonlinear experience growth curve: $1.0 + 0.16 \cdot \text{exp} + 0.006 \cdot \text{exp}^{1.6}$.
- Skill bonuses (e.g. PyTorch, Kubernetes, MLOps, Kafka).
- Natural gaussian noise ($\sigma = 0.11$) and occasional realistic executive outliers (top 2%).
- All generated records carry `is_synthetic = true`.

---

## 2. Preventing Data Leakage in Machine Learning

Salary estimation pipelines easily fall prey to data leakage:
1. **Target leakage:** Derived columns or post-tax fields must never enter feature vectors.
2. **Preprocessor fitting:** The `OneHotEncoder`, `StandardScaler`, and `MultiHotSkillEncoder` are fit strictly on the 80% training split. The 20% test split is transformed only.
3. **Multi-hot skill vocabulary:** The skill vocabulary is determined strictly from training records with frequency $\ge 3$.

---

## 3. Financial Decomposition Formulas (Offer Studio)

$$\text{Total CTC} = \text{Fixed Base} + \text{Variable Bonus} + \text{Joining Bonus} + \text{Annual Perks}$$

$$\text{Recurring Gross Annual} = \text{Fixed Base} + \text{Variable Bonus} + \text{Annual Perks}$$

$$\text{Monthly Gross Equivalent} = \frac{\text{Recurring Gross Annual}}{12}$$

$$\text{Net Cash In-Hand (Annual)} = \max(0, \text{Fixed Base} + \text{Variable Bonus} - \text{Annual Deductions})$$

$$\text{Estimated Monthly Take-Home} = \frac{\text{Net Cash In-Hand}}{12}$$

$$\text{Estimated Monthly Disposable} = \text{Estimated Monthly Take-Home} - (\text{Rent} + \text{Commute} + \text{Other Living Costs})$$
