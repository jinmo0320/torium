CREATE TABLE users (
    id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    tag VARCHAR(6) NOT NULL,
    password VARCHAR(150) NOT NULL,
    risk_type ENUM('STABLE', 'STABLE_SEEK', 'NEUTRAL', 'ACTIVE', 'AGGRESSIVE') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    token_value VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 14 DAY) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 5 MINUTE) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verification_status (
	id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE survey_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL,
    order_no TINYINT NOT NULL
);

CREATE TABLE survey_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    order_no TINYINT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id)
);

CREATE TABLE portfolios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),
    description TEXT,
    status ENUM('PENDING', 'STABLE', 'DISABLED') NOT NULL,
    min_return DECIMAL(5,4),
    max_return DECIMAL(5,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE portfolio_ownership (
    user_id CHAR(36) NOT NULL,
    portfolio_id INT,

    PRIMARY KEY (user_id, portfolio_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE investment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,

    initial_amount BIGINT,
    monthly_amount INT,
    start_date DATE,
    payment_day TINYINT,
    period INT,
    expected_return DECIMAL(5,4),
    target_amount BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE plan_assignment (
    portfolio_id INT,
    plan_id INT UNIQUE,
    version INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    PRIMARY KEY (portfolio_id, plan_id),
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE
);

CREATE TABLE payment_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,

    sequence INT NOT NULL,
    expected_date DATE NOT NULL,
    expected_amount INT NOT NULL,
    status ENUM('PENDING', 'PAID', 'MISSED', 'SKIPPED') DEFAULT 'PENDING',
    actual_paid_amount INT,
    actual_paid_date DATETIME,

    portfolio_id INT NOT NULL,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) DEFAULT 'CUSTOM', -- 마스터는 코드 부여, 직접 추가는 CUSTOM
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(50) NOT NULL,
    description TEXT,
    min_return DECIMAL(5,4),
    max_return DECIMAL(5,4),

    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE item_allocation (
    portfolio_id INT,
    item_id INT,

    name VARCHAR(50),
    description TEXT,
    portion DECIMAL(5,4) DEFAULT 0,

    PRIMARY KEY (portfolio_id, item_id),
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE payment_allocation (
    schedule_id INT,
    item_id INT,

    expected_amount INT NOT NULL,
    status ENUM('PENDING', 'PAID', 'MISSED', 'SKIPPED') DEFAULT 'PENDING',
    actual_paid_amount INT,

    PRIMARY KEY (schedule_id, item_id),
    FOREIGN KEY (schedule_id) REFERENCES payment_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE item_ownership (
    user_id CHAR(36) NOT NULL,
    item_id INT,

    is_private BOOLEAN DEFAULT TRUE,

    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE category_ownership (
    user_id CHAR(36) NOT NULL,
    category_id INT,

    is_private BOOLEAN DEFAULT TRUE,

    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE portfolio_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_return_percent INT NOT NULL,
    min_return DECIMAL(5,4),
    max_return DECIMAL(5,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preset_item_allocation (
    preset_id INT,
    item_id INT,

    portion DECIMAL(5,4) DEFAULT 0,

    PRIMARY KEY (preset_id, item_id),
    FOREIGN KEY (preset_id) REFERENCES portfolio_presets(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

INSERT INTO survey_questions (question_text, order_no) VALUES
    ('귀하의 투자 목적은 무엇입니까?', 1),
    ('투자 자금을 얼마나 오랜 기간 운용할 수 있습니까?', 2),
    ('금융자산 중 투자 자산이 차지하는 비중은?', 3),
    ('귀하의 소득 상태는 어떠합니까?', 4),
    ('투자 경험이 있는 상품은 무엇입니까?', 5),
    ('금융 투자 상품에 대한 이해 수준은?', 6),
    ('투자금이 10% 손실이 발생할 경우 귀하의 대응은?', 7),
    ('최대 어느 정도 손실까지 감내 가능합니까?', 8),
    ('투자 수익의 변동성에 대한 생각은?', 9),
    ('다음 중 본인과 가장 가까운 설명은?', 10);

INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (1, '원금 보전이 가장 중요', 1),
    (1, '원금 보전 + 소폭 수익', 2),
    (1, '자산의 중장기적 성장', 3),
    (1, '높은 수익 추구 (원금 손실 감수)', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (2, '1년 미만', 1),
    (2, '1년 이상 ~ 3년 미만', 2),
    (2, '3년 이상 ~ 5년 미만', 3),
    (2, '5년 이상', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (3, '10% 미만', 1),
    (3, '10% 이상 ~ 30% 미만', 2),
    (3, '30% 이상 ~ 50% 미만', 3),
    (3, '50% 이상', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (4, '소득이 없거나 매우 불안정', 1),
    (4, '일정한 소득 있으나 여유 없음', 2),
    (4, '안정적 소득과 일부 여유 자금', 3),
    (4, '매우 안정적이며 여유 자금 충분', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (5, '예·적금, CMA', 1),
    (5, '채권형 펀드, MMF', 2),
    (5, '주식형 펀드, ETF, 주식', 3),
    (5, '파생상품, ELW, 가상자산 등', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (6, '거의 없음', 1),
    (6, '기본 구조는 이해', 2),
    (6, '위험·수익 구조 이해', 3),
    (6, '상품 구조와 리스크를 충분히 이해', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (7, '즉시 전량 매도', 1),
    (7, '일부 매도', 2),
    (7, '보유 유지', 3),
    (7, '추가 투자 고려', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (8, '5% 이내', 1),
    (8, '10% 이내', 2),
    (8, '20% 이내', 3),
    (8, '20% 초과 가능', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (9, '변동성이 매우 싫다', 1),
    (9, '낮은 변동성 선호', 2),
    (9, '일정 변동성 감내 가능', 3),
    (9, '변동성이 커도 무관', 4);
INSERT INTO survey_answers (question_id, answer_text, order_no) VALUES
    (10, '안정적 수익만을 추구', 1),
    (10, '안정성과 수익의 균형', 2),
    (10, '수익 중심, 위험 일부 감수', 3),
    (10, '수익 최우선, 위험 적극 감수', 4);

INSERT INTO categories (code, name, description) VALUES
    ('STOCK', '주식', '국내외 주식 자산'),
    ('BOND', '채권', '국내외 채권 자산'),
    ('GOLD', '금', '금 현물 및 관련 자산'),
    ('CASH', '현금', '예적금 및 현금성 자산');

INSERT INTO items (id, category_id, name, description, min_return, max_return) VALUES
    -- 주식
    (1, 1, '나스닥100', '미국 나스닥 기술주 중심 투자', 0.105, 0.155),
    (2, 1, 'S&P500', '미국 우량 대형주 분산 투자', 0.075, 0.105),
    (3, 1, '배당 성장주', '미국 배당 성장 기업 투자', 0.065, 0.095),
    (4, 1, '글로벌 주식', '전세계 주식 분산 투자', 0.055, 0.085),
    (5, 1, '국내 대형주', '한국 코스피 대표 기업 투자', 0.040, 0.080),
    -- 채권
    (6, 2, '미국 장기 국채', '미국 20년+ 만기 국채', 0.040, 0.070),
    (7, 2, '미국 중기 국채', '미국 7-10년 만기 국채', 0.035, 0.050),
    (8, 2, '국내 장기 국채', '한국 10년+ 만기 국채', 0.035, 0.045),
    (9, 2, '국내 중기 국채', '한국 3-5년 만기 국채', 0.032, 0.038),
    (10, 2, '우량 회사채', 'A- 이상 국내외 우량 회사채', 0.045, 0.055),
    (11, 2, '국내 단기 채권', '1년 미만 단기 유동성 채권', 0.030, 0.035),
    -- 금
    (12, 3, '금 현물', '실물 금 투자 및 헤지', 0.020, 0.060),
    -- 현금
    (13, 4, '정기 예적금', '은행 확정 금리 상품', 0.022, 0.038),
    (14, 4, 'CMA/파킹통장', '수시입출금 유동성 자산', 0.020, 0.035);

INSERT INTO portfolio_presets (id, code, name, description, target_return_percent, min_return, max_return) VALUES
    (2, 'PRESET_02', '2% 안정 지향형', '원금 보호 중심의 유동성 포트폴리오', 2, 0.0200, 0.0350),
    (3, 'PRESET_03', '3% 보수적 투자형', '예적금보다 소폭 높은 수익 추구', 3, 0.0270, 0.0390),
    (4, 'PRESET_04', '4% 방어적 성장형', '채권 수익 기반의 안정적 증식', 4, 0.0360, 0.0530),
    (5, 'PRESET_05', '5% 중립적 균형형', '시장 변동성에 대응하는 자산배분', 5, 0.0430, 0.0630),
    (6, 'PRESET_06', '6% 안정 성장형', '배당주와 우량주 조화', 6, 0.0500, 0.0730),
    (7, 'PRESET_07', '7% 중위험 중수익', '자산배분의 표준 모델', 7, 0.0610, 0.0890),
    (8, 'PRESET_08', '8% 적극 투자형', '시장 수익률 상회를 목표로 하는 공격적 구성', 8, 0.0710, 0.1030),
    (9, 'PRESET_09', '9% 전략적 성장형', '주식 비중을 높인 자산 증식 전략', 9, 0.0810, 0.1180),
    (10, 'PRESET_10', '10% 고수익 추구형', '나스닥 성장에 집중하는 고수익 모델', 10, 0.0910, 0.1350),
    (11, 'PRESET_11', '11% 주식 집중형 (Lv.1)', '주식의 성장성에 올인하는 전략', 11, 0.1010, 0.1480),
    (12, 'PRESET_12', '12% 주식 집중형 (Lv.2)', '나스닥 비중을 극대화한 초공격적 모델', 12, 0.1120, 0.1630),
    (13, 'PRESET_13', '13% 기술주 주도형 (Lv.1)', '글로벌 기술 성장주 중심 고성장 모델', 13, 0.1020, 0.1510),
    (14, 'PRESET_14', '14% 기술주 주도형 (Lv.2)', '변동성을 감수한 최대 성장 추구', 14, 0.1020, 0.1500),
    (15, 'PRESET_15', '15% 나스닥 올인형', '나스닥 100 지수 완벽 추종', 15, 0.1050, 0.1550);

INSERT INTO preset_item_allocation (preset_id, item_id, portion) VALUES
    -- 2% (CMA 100)
    (2, 14, 1.0000),
    -- 3% (국내중기 40, 예적금 60)
    (3, 9, 0.4000), (3, 13, 0.6000),
    -- 4% (배당주 10, 우량회사채 40, 국내장기 30, CMA 20)
    (4, 3, 0.1000), (4, 10, 0.4000), (4, 8, 0.3000), (4, 14, 0.2000),
    -- 5% (S&P500 20, 우량회사채 30, 미국장기 30, 금현물 10, 예적금 10)
    (5, 2, 0.2000), (5, 10, 0.3000), (5, 6, 0.3000), (5, 12, 0.1000), (5, 13, 0.1000),
    -- 6% (S&P 30, 나스닥 10, 미국장기 30, 우량회사채 15, 금현물 10, CMA 5)
    (6, 2, 0.3000), (6, 1, 0.1000), (6, 6, 0.3000), (6, 10, 0.1500), (6, 12, 0.1000), (6, 14, 0.0500),
    -- 7% (S&P 40, 나스닥 20, 미국장기 20, 우량회사채 10, 금현물 10)
    (7, 2, 0.4000), (7, 1, 0.2000), (7, 6, 0.2000), (7, 10, 0.1000), (7, 12, 0.1000),
    -- 8% (S&P 40, 나스닥 30, 미국장기 20, 금현물 10)
    (8, 2, 0.4000), (8, 1, 0.3000), (8, 6, 0.2000), (8, 12, 0.1000),
    -- 9% (나스닥 40, S&P 40, 미국장기 20)
    (9, 1, 0.4000), (9, 2, 0.4000), (9, 6, 0.2000),
    -- 10% (나스닥 60, S&P 30, 미국장기 10)
    (10, 1, 0.6000), (10, 2, 0.3000), (10, 6, 0.1000),
    -- 11% (나스닥 75, S&P 25)
    (11, 1, 0.7500), (11, 2, 0.2500),
    -- 12% (나스닥 85, S&P 15)
    (12, 1, 0.8500), (12, 2, 0.1500),
    -- 13% (나스닥 90, S&P 10)
    (13, 1, 0.9000), (13, 2, 0.1000),
    -- 14% (나스닥 95, S&P 5)
    (14, 1, 0.9500), (14, 2, 0.0500),
    -- 15% (나스닥 100)
    (15, 1, 1.0000);