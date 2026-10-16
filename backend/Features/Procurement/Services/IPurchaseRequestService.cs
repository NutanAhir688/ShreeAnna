using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Features.Procurement.DTOs;

namespace backend.Features.Procurement.Services;

public interface IPurchaseRequestService
{
    Task<List<PurchaseRequestResponseDto>> GetAllAsync(string? status = null, string? processorId = null);
    Task<PurchaseRequestResponseDto?> GetByIdAsync(Guid id);
    Task<PurchaseRequestResponseDto?> GetByCodeOrAgreementIdAsync(string identifier);
    Task<PurchaseRequestResponseDto> CreateAsync(CreatePurchaseRequestDto dto, string? processorId = null, string? processorName = null);
    Task<PurchaseRequestResponseDto?> ProposeAgreementAsync(Guid id, ProposeAgreementDto dto);
    Task<PurchaseRequestResponseDto?> AcceptAgreementAsync(Guid id);
    Task<PurchaseRequestResponseDto?> ProcessPaymentAsync(Guid id, ProcessPaymentDto dto);
    Task<PurchaseRequestResponseDto?> ConfirmDeliveryAsync(Guid id, ConfirmProcessorDeliveryDto dto);
}
