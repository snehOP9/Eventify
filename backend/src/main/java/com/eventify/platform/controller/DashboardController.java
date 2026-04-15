package com.eventify.platform.controller;

import com.eventify.platform.dto.dashboard.DashboardSummaryResponse;
import com.eventify.platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> summary() {
        return ResponseEntity.ok(dashboardService.getOrganizerSummary());
    }

    @GetMapping("/organizer")
    public ResponseEntity<DashboardSummaryResponse> organizerSummary() {
        return ResponseEntity.ok(dashboardService.getOrganizerSummary());
    }

    @GetMapping("/attendee")
    public ResponseEntity<DashboardSummaryResponse> attendeeSummary() {
        return ResponseEntity.ok(dashboardService.getOrganizerSummary());
    }
}
