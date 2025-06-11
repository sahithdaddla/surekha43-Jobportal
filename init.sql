CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(70) NOT NULL,
    company VARCHAR(70) NOT NULL,
    department VARCHAR(70),
    location VARCHAR(70) NOT NULL,
    category VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    skills TEXT,
    benefits TEXT,
    deadline DATE,
    contact_email VARCHAR(255) NOT NULL,
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max > salary_min)
);


CREATE INDEX idx_jobs_search ON jobs USING GIN (
    to_tsvector('english', title || ' ' || company || ' ' || location || ' ' || skills)
);
CREATE INDEX idx_jobs_type ON jobs (job_type);
CREATE INDEX idx_jobs_experience ON jobs (experience_level);
CREATE INDEX idx_jobs_category ON jobs (category);
CREATE INDEX idx_jobs_posted_date ON jobs (posted_date);
