package com.eventify.platform.controller;

import com.eventify.platform.dto.payment.RazorpayOrderRequest;
import com.eventify.platform.dto.payment.RazorpayOrderResponse;
import com.eventify.platform.service.RazorpayPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayPaymentService razorpayPaymentService;

    @PostMapping("/razorpay/order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@Valid @RequestBody RazorpayOrderRequest request) {
        return ResponseEntity.ok(razorpayPaymentService.createOrder(request));
    }
}
