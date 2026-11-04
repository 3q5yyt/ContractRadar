package com.contractradar.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.entity.AdminUser;
import com.contractradar.entity.AnalysisRecord;
import com.contractradar.entity.AppUser;
import com.contractradar.entity.ContractTemplate;
import com.contractradar.entity.Feedback;
import com.contractradar.entity.LawArticle;
import com.contractradar.entity.RiskRule;
import com.contractradar.mapper.AdminUserMapper;
import com.contractradar.mapper.AnalysisRecordMapper;
import com.contractradar.mapper.AppUserMapper;
import com.contractradar.mapper.ContractTemplateMapper;
import com.contractradar.mapper.FeedbackMapper;
import com.contractradar.mapper.LawArticleMapper;
import com.contractradar.mapper.RiskRuleMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminUserMapper adminUserMapper;
    private final AppUserMapper appUserMapper;
    private final ContractTemplateMapper templateMapper;
    private final RiskRuleMapper riskRuleMapper;
    private final LawArticleMapper lawArticleMapper;
    private final AnalysisRecordMapper analysisRecordMapper;
    private final FeedbackMapper feedbackMapper;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminUserMapper adminUserMapper,
                           AppUserMapper appUserMapper,
                           ContractTemplateMapper templateMapper,
                           RiskRuleMapper riskRuleMapper,
                           LawArticleMapper lawArticleMapper,
                           AnalysisRecordMapper analysisRecordMapper,
                           FeedbackMapper feedbackMapper,
                           PasswordEncoder passwordEncoder) {
        this.adminUserMapper = adminUserMapper;
        this.appUserMapper = appUserMapper;
        this.templateMapper = templateMapper;
        this.riskRuleMapper = riskRuleMapper;
        this.lawArticleMapper = lawArticleMapper;
        this.analysisRecordMapper = analysisRecordMapper;
        this.feedbackMapper = feedbackMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminUserMapper.selectCount(null) == 0) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("系统管理员");
            admin.setRole("ADMIN");
            admin.setStatus(1);
            admin.setCreatedAt(LocalDateTime.now());
            adminUserMapper.insert(admin);
        }

        if (appUserMapper.selectCount(null) == 0) {
            insertUser("student01", "王同学", "13800000001", 1, 9);
            insertUser("student02", "李同学", "13800000002", 1, 7);
            insertUser("student03", "赵同学", "13800000003", 0, 5);
        }

        if (templateMapper.selectCount(null) == 0) {
            insertTemplate("标准租房合同（北京）", "整租",
                    "第一条 房屋基本情况\n第二条 租赁期限\n第三条 租金及支付方式\n第四条 押金\n第五条 押金退还\n第六条 违约责任", 1, 2);
            insertTemplate("合租租房合同（示例）", "合租",
                    "第一条 房屋及公共区域\n第二条 租期与租金\n第三条 水电物业分摊\n第四条 押金与退租", 1, 4);
            insertTemplate("简易租房合同（示例）", "整租",
                    "第一条 房屋信息\n第二条 租期\n第三条 租金与押金\n第四条 维修责任", 0, 6);
        }

        if (riskRuleMapper.selectCount(null) == 0) {
            insertRiskRule("押金与租金", "押金,不退,折旧费,涨租", "high",
                    "押金应优先抵扣实际损失，不能一律没收；单方涨租也应双方协商。",
                    "改为押金在扣除实际损失后返还，租期内租金保持不变。");
            insertRiskRule("违约金", "违约金,两个月租金,滞纳金", "high",
                    "押金不退再加两个月租金可能构成双重惩罚，违约金应与实际损失匹配。",
                    "违约金调整为一个月租金，滞纳金降到合理比例。");
            insertRiskRule("维修责任", "维修,设施,水管,电路", "high",
                    "房屋主体结构和自然损耗通常由出租人维修，不能全部转嫁给承租人。",
                    "区分自然损耗与人为损坏，前者由房东承担。");
            insertRiskRule("转租与退租", "转租,转借,押金不退", "medium",
                    "转租需经房东同意，但押金全部不退作为后果过重。",
                    "未经同意转租可解除合同，押金按实际损失结算。");
            insertRiskRule("提前解约", "提前解约,无责解约,卖房", "high",
                    "房东可无责解约而承租人高额赔偿，权利义务不对等。",
                    "双方对等：提前 30 天通知，各承担一个月租金违约金。");
            insertRiskRule("免责与争议", "免责,安全事故,管辖,法院", "medium",
                    "造成人身损害的免责条款可能无效；管辖约定应便于双方维权。",
                    "按过错划分安全责任，争议由房屋所在地法院管辖。");
        }

        if (lawArticleMapper.selectCount(null) == 0) {
            insertLaw("《中华人民共和国民法典》", "第五百八十五条",
                    "约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。",
                    "违约金,过高,调整", "2021-01-01");
            insertLaw("《中华人民共和国民法典》", "第七百一十二条",
                    "出租人应当履行租赁物的维修义务，但是当事人另有约定的除外。",
                    "维修,出租人,义务", "2021-01-01");
            insertLaw("《中华人民共和国民法典》", "第七百一十六条",
                    "承租人经出租人同意，可以将租赁物转租给第三人；未经同意转租的，出租人可以解除合同。",
                    "转租,同意,解除", "2021-01-01");
            insertLaw("《中华人民共和国民法典》", "第五百零六条",
                    "合同中的下列免责条款无效：造成对方人身损害的；因故意或者重大过失造成对方财产损失的。",
                    "免责,人身损害,无效", "2021-01-01");
            insertLaw("《中华人民共和国民法典》", "第四百九十七条",
                    "提供格式条款一方不合理地免除或者减轻其责任、加重对方责任、限制对方主要权利的，该格式条款无效。",
                    "格式条款,无效,公平", "2021-01-01");
            insertLaw("《中华人民共和国民事诉讼法》", "第三十五条",
                    "合同纠纷当事人可以书面协议选择与争议有实际联系的地点的人民法院管辖。",
                    "管辖,协议,法院", "2023-09-01");
        }

        if (analysisRecordMapper.selectCount(null) == 0) {
            List<AnalysisRecord> records = new ArrayList<>();
            records.add(insertAnalysis(1L, "房屋租赁合同（示例）", 78, 5, 4, 0,
                    "押金退还、违约金、维修责任和安全免责条款对承租人明显不利，建议重点协商第 5、6、7、10、11 条。",
                    "mock", 6));
            records.add(insertAnalysis(2L, "合租合同（示例）", 62, 3, 3, 1,
                    "合租费用分摊和退租条款需要进一步明确，押金退还未约定具体时限。",
                    "api", 4));
            records.add(insertAnalysis(1L, "标准租房合同（北京）", 35, 1, 2, 2,
                    "整体风险可控，建议补充押金退还时限和维修责任划分。",
                    "api", 2));
            records.add(insertAnalysis(3L, "简易租房合同（示例）", 71, 4, 2, 0,
                    "维修责任和提前解约条款风险较高，建议在签约前修改。",
                    "mock", 1));

            if (feedbackMapper.selectCount(null) == 0 && !records.isEmpty()) {
                insertFeedback(records.get(0).getId(), 1L,
                        "第 6 条违约金的分析很准确，希望能增加押金退还时限的建议。", 0, 1);
                insertFeedback(records.get(1).getId(), 2L,
                        "合租费用分摊的提示有用，但希望支持更多合租场景。", 1, 2);
                insertFeedback(records.get(2).getId(), 1L,
                        "报告里的法条依据很清楚，建议增加导出 PDF。", 0, 3);
            }
        }
    }

    private void insertUser(String username, String nickname, String phone, int status, int daysAgo) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setNickname(nickname);
        user.setPhone(phone);
        user.setStatus(status);
        user.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        appUserMapper.insert(user);
    }

    private void insertTemplate(String name, String category, String content, int status, int daysAgo) {
        ContractTemplate template = new ContractTemplate();
        template.setName(name);
        template.setCategory(category);
        template.setContent(content);
        template.setStatus(status);
        template.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo));
        templateMapper.insert(template);
    }

    private void insertRiskRule(String riskType, String keywords, String level,
                                String explanation, String suggestion) {
        RiskRule rule = new RiskRule();
        rule.setRiskType(riskType);
        rule.setKeywords(keywords);
        rule.setLevel(level);
        rule.setExplanation(explanation);
        rule.setSuggestion(suggestion);
        rule.setStatus(1);
        rule.setUpdatedAt(LocalDateTime.now());
        riskRuleMapper.insert(rule);
    }

    private void insertLaw(String lawName, String articleNo, String content,
                           String keywords, String effectiveDate) {
        LawArticle law = new LawArticle();
        law.setLawName(lawName);
        law.setArticleNo(articleNo);
        law.setContent(content);
        law.setKeywords(keywords);
        law.setEffectiveDate(effectiveDate);
        law.setStatus(1);
        law.setUpdatedAt(LocalDateTime.now());
        lawArticleMapper.insert(law);
    }

    private AnalysisRecord insertAnalysis(Long userId, String contractName, int score,
                                          int high, int medium, int low, String summary,
                                          String source, int daysAgo) {
        AnalysisRecord record = new AnalysisRecord();
        record.setUserId(userId);
        record.setContractName(contractName);
        record.setOverallScore(score);
        record.setHighCount(high);
        record.setMediumCount(medium);
        record.setLowCount(low);
        record.setSummary(summary);
        record.setSource(source);
        record.setResultJson("{}");
        record.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        analysisRecordMapper.insert(record);
        return record;
    }

    private void insertFeedback(Long analysisId, Long userId, String content, int status, int daysAgo) {
        Feedback feedback = new Feedback();
        feedback.setAnalysisId(analysisId);
        feedback.setUserId(userId);
        feedback.setContent(content);
        feedback.setStatus(status);
        feedback.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        feedbackMapper.insert(feedback);
    }
}