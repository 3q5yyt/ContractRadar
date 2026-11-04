package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.entity.LawArticle;
import com.contractradar.mapper.LawArticleMapper;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/laws")
public class AdminLawController {

    private final LawArticleMapper lawArticleMapper;

    public AdminLawController(LawArticleMapper lawArticleMapper) {
        this.lawArticleMapper = lawArticleMapper;
    }

    @GetMapping
    public ApiResponse<List<LawArticle>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<LawArticle> query = Wrappers.lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(LawArticle::getLawName, keyword)
                    .or().like(LawArticle::getArticleNo, keyword)
                    .or().like(LawArticle::getKeywords, keyword)
                    .or().like(LawArticle::getContent, keyword));
        }
        query.orderByAsc(LawArticle::getLawName).orderByAsc(LawArticle::getArticleNo);
        return ApiResponse.ok(lawArticleMapper.selectList(query));
    }

    @PostMapping
    public ApiResponse<LawArticle> create(@RequestBody LawArticle body) {
        body.setId(null);
        if (body.getStatus() == null) {
            body.setStatus(1);
        }
        body.setUpdatedAt(LocalDateTime.now());
        lawArticleMapper.insert(body);
        return ApiResponse.ok(body);
    }

    @PutMapping("/{id}")
    public ApiResponse<LawArticle> update(@PathVariable Long id, @RequestBody LawArticle body) {
        LawArticle existing = lawArticleMapper.selectById(id);
        if (existing == null) {
            throw new BizException("法条不存在");
        }
        body.setId(id);
        if (body.getStatus() == null) {
            body.setStatus(existing.getStatus());
        }
        body.setUpdatedAt(LocalDateTime.now());
        lawArticleMapper.updateById(body);
        return ApiResponse.ok(lawArticleMapper.selectById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        lawArticleMapper.deleteById(id);
        return ApiResponse.ok(null);
    }
}