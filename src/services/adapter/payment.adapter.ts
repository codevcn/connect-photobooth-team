import {
  TPaymentInstruction,
  TPaymentInstructionStatus,
  TOrderResponse,
} from '@/utils/types/api'

/**
 * Client-side payment types
 */
export type TClientPaymentInstruction = {
  id: number
  orderId: number
  bankInfo: {
    bin: string
    accountNumber: string
    accountName: string
  }
  amount: string
  description: string
  orderCode: string
  currency: string
  paymentLinkId: string
  status: TPaymentInstructionStatus
  checkoutUrl: string
  qrCode: string
  createdAt: Date
  updatedAt: Date
}

export type TClientPaymentSummary = {
  qrCode: string
  checkoutUrl: string
  amount: string
  currency: string
  status: TPaymentInstructionStatus
  bankInfo: {
    bin: string
    accountNumber: string
    accountName: string
  }
  orderCode: string
  description: string
}

/**
 * PaymentAdapter - Chuyển đổi dữ liệu thanh toán từ API sang cấu trúc Client
 */
export class PaymentAdapter {
  /**
   * Convert TPaymentInstruction sang TClientPaymentInstruction
   */
  static toClientPaymentInstruction(
    apiPayment: TPaymentInstruction
  ): TClientPaymentInstruction {
    return {
      id: apiPayment.id,
      orderId: apiPayment.order_id,
      bankInfo: {
        bin: apiPayment.bin,
        accountNumber: apiPayment.account_number,
        accountName: apiPayment.account_name,
      },
      amount: apiPayment.amount,
      description: apiPayment.description,
      orderCode: apiPayment.order_code,
      currency: apiPayment.currency,
      paymentLinkId: apiPayment.payment_link_id,
      status: apiPayment.status,
      checkoutUrl: apiPayment.checkout_url,
      qrCode: apiPayment.qr_code,
      createdAt: new Date(apiPayment.created_at),
      updatedAt: new Date(apiPayment.updated_at),
    }
  }

  /**
   * Convert TPaymentInstruction[] sang TClientPaymentInstruction[]
   */
  static toClientPaymentInstructions(
    apiPayments: TPaymentInstruction[]
  ): TClientPaymentInstruction[] {
    return apiPayments.map((payment) => this.toClientPaymentInstruction(payment))
  }

  /**
   * Extract payment summary từ TOrderResponse
   */
  static extractPaymentSummary(orderResponse: TOrderResponse): TClientPaymentSummary | null {
    const paymentInstruction = orderResponse.payment_instructions[0]
    
    if (!paymentInstruction) return null

    return {
      qrCode: paymentInstruction.qr_code,
      checkoutUrl: paymentInstruction.checkout_url,
      amount: paymentInstruction.amount,
      currency: paymentInstruction.currency,
      status: paymentInstruction.status,
      bankInfo: {
        bin: paymentInstruction.bin,
        accountNumber: paymentInstruction.account_number,
        accountName: paymentInstruction.account_name,
      },
      orderCode: paymentInstruction.order_code,
      description: paymentInstruction.description,
    }
  }

  /**
   * Check xem payment đã hoàn thành chưa
   */
  static isPaymentCompleted(status: TPaymentInstructionStatus): boolean {
    return status === 'SUCCESS'
  }

  /**
   * Check xem payment có đang pending không
   */
  static isPaymentPending(status: TPaymentInstructionStatus): boolean {
    return status === 'PENDING'
  }

  /**
   * Check xem payment có failed không
   */
  static isPaymentFailed(status: TPaymentInstructionStatus): boolean {
    return status === 'FAILED'
  }

  /**
   * Format payment status sang text hiển thị
   */
  static formatPaymentStatus(status: TPaymentInstructionStatus): string {
    const statusMap: Record<TPaymentInstructionStatus, string> = {
      PENDING: 'Đang chờ thanh toán',
      SUCCESS: 'Thanh toán thành công',
      FAILED: 'Thanh toán thất bại',
    }
    return statusMap[status] || 'Không xác định'
  }

  /**
   * Format số tiền
   */
  static formatAmount(amount: string, currency: string = 'VND'): string {
    const numAmount = parseFloat(amount)
    const formatted = numAmount.toLocaleString('vi-VN')
    return `${formatted} ${currency}`
  }
}
