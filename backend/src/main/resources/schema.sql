CREATE TABLE IF NOT EXISTS admin_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    name VARCHAR(64),
    role VARCHAR(32) DEFAULT 'ADMIN',
    status INT DEFAULT 1,
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(128),
    nickname VARCHAR(64),
    phone VARCHAR(32),
    status INT DEFAULT 1,
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS contract_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64),
    content TEXT,
    status INT DEFAULT 1,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS risk_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    risk_type VARCHAR(64),
    keywords VARCHAR(255),
    level VARCHAR(16),
    explanation TEXT,
    suggestion TEXT,
    status INT DEFAULT 1,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS law_article (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    law_name VARCHAR(128),
    article_no VARCHAR(64),
    content TEXT,
    keywords VARCHAR(255),
    effective_date VARCHAR(32),
    status INT DEFAULT 1,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS analysis_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    contract_name VARCHAR(128),
    overall_score INT,
    high_count INT,
    medium_count INT,
    low_count INT,
    summary TEXT,
    source VARCHAR(16),
    result_json TEXT,
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT,
    user_id BIGINT,
    content TEXT,
    status INT DEFAULT 0,
    created_at DATETIME
);