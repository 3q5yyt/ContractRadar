package com.contractradar.dto;

import jakarta.validation.constraints.NotBlank;

public record FeedbackRequest(
        Long analysisId,
        Long userId,
        @NotBlank(message = "反馈内容不能为空") String content
) {
}