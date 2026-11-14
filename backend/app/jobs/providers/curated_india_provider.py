"""
Curated Indian Tech Job Provider.
Supplies high-fidelity, calibrated Indian technology job openings across top tech hubs,
startups, product companies, and IT giants.
All records are marked with is_synthetic=True for evaluation transparency.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from backend.app.jobs.providers.job_provider_base import JobProviderBase

def utc_now():
    return datetime.now(timezone.utc)

# High-density Indian tech companies
INDIAN_COMPANIES = [
    {"name": "Zoho Corporation", "cities": ["Chennai", "Tirunelveli", "Madurai", "Coimbatore"], "type": "Product SaaS"},
    {"name": "Freshworks", "cities": ["Chennai", "Bengaluru", "Hyderabad"], "type": "Product SaaS"},
    {"name": "Swiggy", "cities": ["Bengaluru", "Hyderabad", "Delhi NCR"], "type": "Consumer Tech"},
    {"name": "Zomato", "cities": ["Delhi NCR", "Bengaluru", "Mumbai"], "type": "Consumer Tech"},
    {"name": "CRED", "cities": ["Bengaluru", "Mumbai"], "type": "Fintech"},
    {"name": "Razorpay", "cities": ["Bengaluru", "Chennai", "Mumbai"], "type": "Fintech"},
    {"name": "PhonePe", "cities": ["Bengaluru", "Pune", "Mumbai"], "type": "Fintech"},
    {"name": "Flipkart", "cities": ["Bengaluru", "Delhi NCR", "Hyderabad"], "type": "E-Commerce"},
    {"name": "Zerodha", "cities": ["Bengaluru", "Remote"], "type": "Fintech Brokerage"},
    {"name": "Jio Platforms", "cities": ["Mumbai", "Bengaluru", "Hyderabad", "Pune"], "type": "Telecom & AI"},
    {"name": "Thoughtworks", "cities": ["Bengaluru", "Chennai", "Pune", "Hyderabad", "Coimbatore"], "type": "Tech Consultancy"},
    {"name": "Tata Consultancy Services (TCS)", "cities": ["Chennai", "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Kochi", "Coimbatore"], "type": "IT Services"},
    {"name": "Infosys", "cities": ["Bengaluru", "Mysuru", "Chennai", "Hyderabad", "Pune", "Thiruvananthapuram"], "type": "IT Services"},
    {"name": "Cognizant", "cities": ["Chennai", "Coimbatore", "Bengaluru", "Hyderabad", "Kolkata", "Pune"], "type": "IT Services"},
    {"name": "Wipro", "cities": ["Bengaluru", "Chennai", "Hyderabad", "Pune", "Kochi"], "type": "IT Services"},
    {"name": "InMobi", "cities": ["Bengaluru", "Delhi NCR"], "type": "AdTech / AI"},
    {"name": "Postman", "cities": ["Bengaluru", "Remote"], "type": "Developer Tools"},
    {"name": "Hasura", "cities": ["Bengaluru", "Remote"], "type": "Cloud & GraphQL"},
    {"name": "BrowserStack", "cities": ["Mumbai", "Bengaluru", "Remote"], "type": "Developer Testing"},
    {"name": "LTIMindtree", "cities": ["Mumbai", "Bengaluru", "Chennai", "Pune", "Hyderabad"], "type": "IT Services"},
    {"name": "Persistent Systems", "cities": ["Pune", "Bengaluru", "Hyderabad", "Nagpur"], "type": "Software Engineering"}
]

STATE_MAP = {
    "Bengaluru": "Karnataka",
    "Chennai": "Tamil Nadu",
    "Hyderabad": "Telangana",
    "Pune": "Maharashtra",
    "Mumbai": "Maharashtra",
    "Delhi NCR": "Delhi",
    "Coimbatore": "Tamil Nadu",
    "Tirunelveli": "Tamil Nadu",
    "Madurai": "Tamil Nadu",
    "Kochi": "Kerala",
    "Thiruvananthapuram": "Kerala",
    "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat",
    "Jaipur": "Rajasthan",
    "Mysuru": "Karnataka",
    "Nagpur": "Maharashtra"
}

ROLE_TEMPLATES = [
    {
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "skills_required": ["SQL", "Python", "Power BI", "Excel"],
        "skills_preferred": ["Tableau", "Pandas", "ETL", "Statistics"],
        "exp_brackets": [
            {"level": "Fresher", "min": 0.0, "max": 1.0, "sal_min": 400000, "sal_max": 700000, "emp": "Full-time"},
            {"level": "Intern", "min": 0.0, "max": 0.5, "sal_min": 240000, "sal_max": 360000, "emp": "Internship"},
            {"level": "Junior", "min": 1.0, "max": 3.0, "sal_min": 650000, "sal_max": 1100000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1100000, "sal_max": 1800000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 10.0, "sal_min": 1800000, "sal_max": 2800000, "emp": "Full-time"}
        ],
        "desc": "Join our data team to transform business requirements into quantitative analytics and high-impact automated reporting.",
        "responsibilities": [
            "Author optimized SQL queries to extract, transform, and aggregate multi-table business metrics.",
            "Design interactive dashboards in Power BI and Tableau for executive decision-makers.",
            "Perform exploratory data analysis and root-cause metric investigations using Python and Pandas.",
            "Collaborate with engineering teams to validate data integrity across data warehouse pipelines."
        ],
        "requirements": [
            "Bachelor's degree in Computer Science, Data Science, Information Technology, or related discipline.",
            "Strong fluency with relational SQL databases (PostgreSQL, MySQL, or Snowflake).",
            "Demonstrated experience with BI tools (Power BI, Tableau) and Python analytics workflows.",
            "Strong communication skills and ability to translate data into actionable product insights."
        ]
    },
    {
        "title": "Machine Learning Engineer",
        "category": "AI & ML",
        "skills_required": ["Python", "PyTorch", "Scikit-Learn", "Machine Learning"],
        "skills_preferred": ["Docker", "MLOps", "FastAPI", "TensorFlow", "Kubernetes"],
        "exp_brackets": [
            {"level": "Junior", "min": 1.0, "max": 2.5, "sal_min": 850000, "sal_max": 1500000, "emp": "Full-time"},
            {"level": "Fresher / AI Trainee", "min": 0.0, "max": 1.0, "sal_min": 600000, "sal_max": 950000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1600000, "sal_max": 2800000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 10.0, "sal_min": 2800000, "sal_max": 4800000, "emp": "Full-time"}
        ],
        "desc": "Design, train, and deploy high-throughput machine learning and deep learning pipelines serving millions of inference calls.",
        "responsibilities": [
            "Develop state-of-the-art predictive models, feature engineering pipelines, and evaluation benchmarks.",
            "Package and serve ML models via low-latency REST and gRPC microservices using FastAPI and Docker.",
            "Implement automated model drift monitoring, continuous training pipelines, and experiment tracking.",
            "Optimize model inference runtime and memory footprint on CPU and GPU accelerators."
        ],
        "requirements": [
            "B.Tech / M.Tech in Artificial Intelligence, Computer Science, or Mathematics.",
            "Proficiency in Python, PyTorch, Scikit-learn, and algorithmic data structures.",
            "Understanding of supervised/unsupervised learning, deep neural nets, and validation methodologies.",
            "Hands-on experience deploying containerized services with Docker is strongly preferred."
        ]
    },
    {
        "title": "Software Engineer",
        "category": "Software Development",
        "skills_required": ["Python", "Java", "Data Structures", "SQL"],
        "skills_preferred": ["FastAPI", "Spring Boot", "Git", "Docker", "AWS"],
        "exp_brackets": [
            {"level": "Graduate Trainee", "min": 0.0, "max": 1.0, "sal_min": 500000, "sal_max": 900000, "emp": "Full-time"},
            {"level": "Intern", "min": 0.0, "max": 0.5, "sal_min": 300000, "sal_max": 450000, "emp": "Internship"},
            {"level": "SDE I", "min": 1.0, "max": 3.0, "sal_min": 900000, "sal_max": 1600000, "emp": "Full-time"},
            {"level": "SDE II", "min": 3.0, "max": 6.0, "sal_min": 1600000, "sal_max": 3000000, "emp": "Full-time"},
            {"level": "Senior SDE", "min": 6.0, "max": 10.0, "sal_min": 3000000, "sal_max": 5200000, "emp": "Full-time"}
        ],
        "desc": "Build scalable, reliable web services and core infrastructure powering our distributed product ecosystem.",
        "responsibilities": [
            "Architect and implement RESTful backend services, modular business logic, and database schemas.",
            "Write comprehensive unit, integration, and performance tests ensuring 99.9% uptime reliability.",
            "Participate in design reviews, peer code audits, and sprint planning sessions.",
            "Triage production incidents and optimize database queries and caching layers."
        ],
        "requirements": [
            "Strong fundamentals in object-oriented programming, data structures, and computer science concepts.",
            "Experience building backend applications in Python (FastAPI/Django) or Java (Spring Boot).",
            "Comfort with SQL databases, git version control, and Linux terminal environments.",
            "Eagerness to learn, write clean maintainable code, and solve real customer problems."
        ]
    },
    {
        "title": "Frontend Developer",
        "category": "Software Development",
        "skills_required": ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        "skills_preferred": ["Tailwind CSS", "Next.js", "Redux", "Jest", "Vite"],
        "exp_brackets": [
            {"level": "Fresher", "min": 0.0, "max": 1.0, "sal_min": 450000, "sal_max": 800000, "emp": "Full-time"},
            {"level": "Junior", "min": 1.0, "max": 3.0, "sal_min": 750000, "sal_max": 1400000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1400000, "sal_max": 2500000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 9.0, "sal_min": 2500000, "sal_max": 4000000, "emp": "Full-time"}
        ],
        "desc": "Craft high-performance, accessible, and responsive user interfaces with modern React and TypeScript stacks.",
        "responsibilities": [
            "Develop component-driven web applications using modern React, TypeScript, and responsive CSS.",
            "Integrate RESTful and WebSocket endpoints with robust error handling and optimistic UI updates.",
            "Ensure cross-browser compatibility, WCAG accessibility, and optimal Core Web Vitals performance.",
            "Collaborate closely with UI/UX designers in Figma to translate wireframes into pixel-perfect code."
        ],
        "requirements": [
            "Demonstrated proficiency in React.js, TypeScript, modern JavaScript (ES6+), and CSS/Tailwind.",
            "Understanding of browser rendering lifecycles, state management, and web security basics.",
            "Portfolio or GitHub projects demonstrating clean, responsive UI implementations."
        ]
    },
    {
        "title": "Data Engineer",
        "category": "Data & Analytics",
        "skills_required": ["Python", "SQL", "Apache Spark", "Airflow"],
        "skills_preferred": ["Kafka", "Snowflake", "AWS", "BigQuery", "Docker"],
        "exp_brackets": [
            {"level": "Associate", "min": 1.0, "max": 3.0, "sal_min": 800000, "sal_max": 1400000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1500000, "sal_max": 2700000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 10.0, "sal_min": 2700000, "sal_max": 4500000, "emp": "Full-time"}
        ],
        "desc": "Construct real-time streaming and batch pipelines that ingest terabytes of data daily into central analytical lakehouses.",
        "responsibilities": [
            "Build robust ELT/ETL pipelines orchestrating distributed Spark transformations via Apache Airflow.",
            "Model dimensional data schemas in modern cloud data warehouses (Snowflake, BigQuery).",
            "Monitor pipeline latency, data partition pruning, and optimize distributed compute costs."
        ],
        "requirements": [
            "Hands-on experience with Python, PySpark, complex SQL, and workflow schedulers.",
            "Deep understanding of partitioned storage formats (Parquet, Delta Lake) and distributed processing."
        ]
    },
    {
        "title": "DevOps Engineer",
        "category": "Infrastructure",
        "skills_required": ["Docker", "Kubernetes", "Linux", "CI/CD"],
        "skills_preferred": ["Terraform", "AWS", "Prometheus", "Python", "Bash"],
        "exp_brackets": [
            {"level": "Junior", "min": 1.0, "max": 3.0, "sal_min": 800000, "sal_max": 1400000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1500000, "sal_max": 2700000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 10.0, "sal_min": 2700000, "sal_max": 4600000, "emp": "Full-time"}
        ],
        "desc": "Scale our cloud infrastructure, manage container orchestration platforms, and maintain zero-downtime CI/CD pipelines.",
        "responsibilities": [
            "Provision and maintain multi-region Kubernetes clusters with infrastructure-as-code via Terraform.",
            "Automate build, test, and containerized deployment pipelines in GitHub Actions and GitLab CI.",
            "Configure centralized logging, alerting, and metric dashboards using Prometheus and Grafana."
        ],
        "requirements": [
            "Solid experience with Linux administration, Docker containerization, and Kubernetes.",
            "Knowledge of cloud platforms (AWS, GCP, or Azure) and infrastructure automation tools."
        ]
    },
    {
        "title": "QA Engineer",
        "category": "Quality & Security",
        "skills_required": ["Selenium", "Python", "API Testing", "Test Automation"],
        "skills_preferred": ["Playwright", "Cypress", "Postman", "SQL", "Jenkins"],
        "exp_brackets": [
            {"level": "Fresher", "min": 0.0, "max": 1.0, "sal_min": 400000, "sal_max": 650000, "emp": "Full-time"},
            {"level": "Junior", "min": 1.0, "max": 3.0, "sal_min": 650000, "sal_max": 1100000, "emp": "Full-time"},
            {"level": "Mid", "min": 3.0, "max": 6.0, "sal_min": 1100000, "sal_max": 1900000, "emp": "Full-time"},
            {"level": "Senior", "min": 6.0, "max": 9.0, "sal_min": 1900000, "sal_max": 3000000, "emp": "Full-time"}
        ],
        "desc": "Design automated test suites, execute rigorous regression workflows, and uphold software quality standards.",
        "responsibilities": [
            "Develop automated end-to-end regression suites using Selenium/Playwright and Python.",
            "Perform thorough REST API validation, load testing, and edge-case boundary analysis.",
            "Integrate automated test runs into daily CI/CD deployment gates."
        ],
        "requirements": [
            "Understanding of software QA methodologies, test case design, and defect lifecycle tracking.",
            "Coding proficiency in Python or Java with hands-on test automation frameworks."
        ]
    },
    {
        "title": "AI Research Engineer",
        "category": "AI & ML",
        "skills_required": ["PyTorch", "NLP", "LLM", "Deep Learning"],
        "skills_preferred": ["Transformers", "HuggingFace", "LangChain", "CUDA", "Python"],
        "exp_brackets": [
            {"level": "Associate", "min": 1.0, "max": 3.0, "sal_min": 1200000, "sal_max": 2200000, "emp": "Full-time"},
            {"level": "Senior", "min": 4.0, "max": 8.0, "sal_min": 2500000, "sal_max": 4800000, "emp": "Full-time"}
        ],
        "desc": "Fine-tune foundation models, build enterprise Retrieval-Augmented Generation (RAG) architectures, and conduct applied LLM research.",
        "responsibilities": [
            "Train and fine-tune open-source LLMs (Llama, Mistral) using LoRA, QLoRA, and RLHF techniques.",
            "Architect production RAG systems with vector databases, embedding pipelines, and semantic search.",
            "Benchmark generative models on accuracy, safety, hallucination rates, and latency."
        ],
        "requirements": [
            "Deep mathematical intuition in transformer architectures, attention mechanisms, and deep learning.",
            "Hands-on expertise with PyTorch, Hugging Face ecosystem, and vector indices."
        ]
    }
]

WORK_MODES = ["On-site", "Hybrid", "Remote"]

class CuratedIndiaProvider(JobProviderBase):
    """
    Curated Indian technology job openings generator.
    Generates 250+ structured job records strictly located in India.
    """

    def __init__(self):
        super().__init__(provider_name="Curated Indian Tech Feed", provider_type="curated")

    def fetch_jobs(self, limit: int = 280, query: Optional[str] = None, city: Optional[str] = None) -> List[Dict[str, Any]]:
        jobs: List[Dict[str, Any]] = []
        job_counter = 1000

        # Deterministic generation across templates and companies
        now = utc_now()

        for comp_idx, company in enumerate(INDIAN_COMPANIES):
            for role_idx, template in enumerate(ROLE_TEMPLATES):
                for exp_idx, exp in enumerate(template["exp_brackets"]):
                    if len(jobs) >= limit:
                        break

                    job_counter += 1
                    # Assign city from company's available cities
                    avail_cities = [c for c in company["cities"] if c != "Remote"]
                    if not avail_cities:
                        avail_cities = ["Bengaluru"]
                    
                    chosen_city = avail_cities[(comp_idx + exp_idx) % len(avail_cities)]
                    
                    # Work mode determination
                    work_mode_choice = WORK_MODES[(comp_idx + role_idx + exp_idx) % len(WORK_MODES)]
                    is_remote = work_mode_choice == "Remote" or "Remote" in company["cities"]
                    if is_remote and (comp_idx % 3 == 0):
                        work_mode_choice = "Remote"

                    # Disclosed salary logic (approx 65% disclosed, 35% undisclosed)
                    is_disclosed = ((comp_idx + exp_idx + role_idx) % 3) != 0
                    sal_min = exp["sal_min"] if is_disclosed else None
                    sal_max = exp["sal_max"] if is_disclosed else None

                    # Vary posted date within past 14 days
                    days_ago = (comp_idx + role_idx + exp_idx) % 14
                    posted_date = now - timedelta(days=days_ago, hours=(job_counter % 24))

                    # Full Job Title
                    title = f"{exp['level']} {template['title']}" if exp['level'] not in ["Junior", "Mid", "Senior"] else f"{exp['level']} {template['title']}"

                    state = STATE_MAP.get(chosen_city, "India")

                    # Compile all skills
                    all_skills = template["skills_required"] + template["skills_preferred"]

                    job_dict = {
                        "source_job_id": f"SAL-IN-{job_counter}",
                        "title": title,
                        "company_name": company["name"],
                        "company_logo_url": f"https://ui-avatars.com/api/?name={company['name'].replace(' ', '+')}&background=1E5345&color=fff&size=128",
                        "city": chosen_city,
                        "state": state,
                        "country": "India",
                        "is_remote_eligible_india": True,
                        "work_mode": work_mode_choice,
                        "employment_type": exp["emp"],
                        "experience_min": exp["min"],
                        "experience_max": exp["max"],
                        "salary_disclosed": is_disclosed,
                        "salary_min": float(sal_min) if sal_min else None,
                        "salary_max": float(sal_max) if sal_max else None,
                        "salary_currency": "INR",
                        "salary_period": "annual",
                        "description": f"{template['desc']} At {company['name']}, we empower high-velocity engineering teams building mission-critical tech solutions.",
                        "responsibilities": template["responsibilities"],
                        "requirements": template["requirements"],
                        "skills_raw": all_skills,
                        "apply_url": f"https://careers.{company['name'].lower().split()[0]}.com/jobs/{job_counter}",
                        "posted_at": posted_date,
                        "is_synthetic": True,
                        "is_active": True,
                        "canonical_role_title": template["title"]
                    }

                    # Filter in-memory if query/city specified
                    if city and city.lower() not in chosen_city.lower():
                        continue
                    if query and query.lower() not in title.lower() and query.lower() not in company["name"].lower():
                        continue

                    std = self.standardize_job(job_dict)
                    if std:
                        std["responsibilities"] = job_dict["responsibilities"]
                        std["requirements"] = job_dict["requirements"]
                        std["posted_at"] = job_dict["posted_at"]
                        std["canonical_role_title"] = job_dict["canonical_role_title"]
                        std["skills_required"] = template["skills_required"]
                        std["skills_preferred"] = template["skills_preferred"]
                        jobs.append(std)

        return jobs
