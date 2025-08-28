'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { currencyService } from '@/lib/api/currencyService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LotteryGame } from '@/types';
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Printer,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PaymentModalProps {
  game: LotteryGame;
  isOpen: boolean;
  onClose: () => void;
}

interface Ticket {
  id: string;
  gameId: string;
  gameTitle: string;
  ticketNumber: string;
  price: number;
  currency: string;
  purchaseDate: number;
  qrCode: string;
}

type PaymentMethod = 'orange' | 'mtn';
type PaymentStep = 'method' | 'phone' | 'processing' | 'success';

export function PaymentModal({ game, isOpen, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [convertedPrice, setConvertedPrice] = useState<number>(
    game.ticketPrice
  );
  const [userCurrency, setUserCurrency] = useState<string>('XAF'); // Central African Franc

  // Convert price to XAF (Central African Franc)
  const convertPrice = useCallback(async () => {
    try {
      if (game.currency !== 'XAF') {
        const converted = await currencyService.convertCurrency(
          game.ticketPrice,
          game.currency,
          'XAF'
        );
        setConvertedPrice(converted);
      } else {
        setConvertedPrice(game.ticketPrice);
      }
    } catch (error) {
      console.error('Currency conversion failed:', error);
      // Use original price if conversion fails
      setConvertedPrice(game.ticketPrice);
    }
  }, [game.ticketPrice, game.currency]);

  useEffect(() => {
    if (isOpen) {
      convertPrice();
      // Reset form state when modal opens
      setStep('method');
      setPhoneNumber('');
      setProcessing(false);
      setTicket(null);
    }
  }, [isOpen, convertPrice]);

  const generateTicket = (gameData: LotteryGame): Ticket => {
    const ticketNumber = `${gameData.id.toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    return {
      id: `ticket-${Date.now()}`,
      gameId: gameData.id,
      gameTitle: gameData.title,
      ticketNumber,
      price: convertedPrice,
      currency: userCurrency,
      purchaseDate: Date.now(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketNumber)}`,
    };
  };

  const validatePhoneNumber = (
    phone: string,
    method: PaymentMethod
  ): boolean => {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s-()]/g, '');

    if (method === 'orange') {
      // Orange Money numbers start with 69 or 65
      return /^(237)?(69|65)\d{7}$/.test(cleanPhone);
    } else if (method === 'mtn') {
      // MTN Mobile Money numbers start with 67, 68, or 65
      return /^(237)?(67|68|65)\d{7}$/.test(cleanPhone);
    }

    return false;
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedMethod)) {
      const provider =
        selectedMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money';
      toast.error(`Please enter a valid ${provider} phone number`);
      return;
    }

    setStep('processing');
    handlePayment();
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to purchase tickets');
      return;
    }

    setProcessing(true);

    try {
      // Simulate mobile money payment processing
      const providerName =
        selectedMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money';
      toast.info(`Processing ${providerName} payment...`);

      // In production, this would integrate with Orange Money/MTN Mobile Money APIs
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Generate ticket after successful payment
      const newTicket = generateTicket(game);
      setTicket(newTicket);

      // Send ticket via email and SMS
      await Promise.all([
        sendTicketEmail(newTicket),
        sendTicketSMS(newTicket, phoneNumber),
      ]);

      setStep('success');
      toast.success(
        `Payment successful via ${providerName}! Ticket sent to your phone and email.`
      );
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(
        'Payment failed. Please check your phone number and try again.'
      );
      setStep('phone');
    } finally {
      setProcessing(false);
    }
  };

  const sendTicketSMS = async (ticketData: Ticket, phone: string) => {
    // In production, integrate with SMS API
    console.log(`Sending ticket SMS to ${phone}:`, ticketData.ticketNumber);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const sendTicketEmail = async (ticketData: Ticket) => {
    // In production, this would be a server-side API call
    console.log('Sending ticket email:', ticketData);
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const printTicket = () => {
    if (!ticket) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lottery Ticket - ${ticket.ticketNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 400px; 
                margin: 20px auto; 
                padding: 20px;
                border: 2px dashed #FF5722;
                background: #fafafa;
              }
              .header { text-align: center; margin-bottom: 20px; }
              .ticket-info { margin: 10px 0; }
              .qr-code { text-align: center; margin: 20px 0; }
              .footer { text-align: center; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>🎫 LOTTERY TICKET</h2>
              <h3>${ticket.gameTitle}</h3>
            </div>
            <div class="ticket-info">
              <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Price:</strong> ${currencyService.formatCurrency(ticket.price, ticket.currency)}</p>
              <p><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleString()}</p>
              <p><strong>Player:</strong> ${user?.firstName} ${user?.lastName}</p>
            </div>
            <div class="qr-code">
              <img src="${ticket.qrCode}" alt="QR Code" />
              <p>Scan to verify</p>
            </div>
            <div class="footer">
              <p>Keep this ticket safe. Good luck!</p>
              <p>Draw Date: ${new Date(game.drawDate).toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    const ticketData = {
      ...ticket,
      playerName: `${user?.firstName} ${user?.lastName}`,
      drawDate: new Date(game.drawDate).toISOString(),
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticketNumber}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (!processing) {
      setStep('method');
      setPhoneNumber('');
      setTicket(null);
      onClose();
    }
  };

  const handlePlayAgain = () => {
    handleClose();
    // Navigate to games page
    window.location.href = '/games';
  };

  const getModalTitle = () => {
    switch (step) {
      case 'method':
        return 'Choose Payment Method';
      case 'phone':
        return 'Enter Phone Number';
      case 'processing':
        return 'Processing Payment';
      case 'success':
        return 'Payment Successful!';
      default:
        return 'Purchase Ticket';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md w-full mx-4'>
        <DialogHeader>
          <DialogTitle className='text-center'>{getModalTitle()}</DialogTitle>
          <DialogDescription className='text-center'>
            {step === 'method' && 'Select your preferred mobile money provider'}
            {step === 'phone' && 'Enter your mobile money phone number'}
            {step === 'processing' &&
              'Please wait while we process your payment'}
            {step === 'success' &&
              'Your lottery ticket has been generated successfully'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {step === 'method' && (
            <>
              {/* Game Info */}
              <div className='bg-muted rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>{game.title}</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Ticket Price:</span>
                    <span className='font-semibold'>
                      {currencyService.formatCurrency(
                        convertedPrice,
                        userCurrency
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Participants:</span>
                    <span>
                      {game.currentParticipants}/{game.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Money Options */}
              <div className='space-y-3'>
                <h4 className='font-medium'>Choose Mobile Money Provider</h4>

                <button
                  onClick={() => setSelectedMethod('orange')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === 'orange'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                      : 'border-border hover:border-orange-300'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center'>
                      <Smartphone className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <div className='font-semibold'>Orange Money</div>
                      <div className='text-sm text-muted-foreground'>
                        Pay with your Orange Money account
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('mtn')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === 'mtn'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10'
                      : 'border-border hover:border-yellow-300'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center'>
                      <Phone className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <div className='font-semibold'>MTN Mobile Money</div>
                      <div className='text-sm text-muted-foreground'>
                        Pay with your MTN Mobile Money account
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Security Notice */}
              <div className='bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3'>
                <div className='flex items-start space-x-2'>
                  <Shield className='w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5' />
                  <div className='text-sm'>
                    <div className='font-medium text-blue-900 dark:text-blue-100'>
                      Secure Payment
                    </div>
                    <div className='text-blue-700 dark:text-blue-200 text-xs'>
                      Your transaction is encrypted and secure
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep('phone')}
                className='w-full'
                size='lg'
              >
                Continue -{' '}
                {currencyService.formatCurrency(convertedPrice, userCurrency)}
              </Button>
            </>
          )}

          {step === 'phone' && (
            <>
              <div className='space-y-4'>
                <div className='text-center'>
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      selectedMethod === 'orange'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {selectedMethod === 'orange' ? (
                      <Smartphone className='w-8 h-8 text-white' />
                    ) : (
                      <Phone className='w-8 h-8 text-white' />
                    )}
                  </div>
                  <h4 className='font-semibold mb-2'>
                    {selectedMethod === 'orange'
                      ? 'Orange Money'
                      : 'MTN Mobile Money'}
                  </h4>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='phoneNumber' className='text-sm font-medium'>
                    Phone Number
                  </label>
                  <input
                    id='phoneNumber'
                    type='tel'
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder={
                      selectedMethod === 'orange'
                        ? '69XXXXXXX or 65XXXXXXX'
                        : '67XXXXXXX, 68XXXXXXX or 65XXXXXXX'
                    }
                    className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                    maxLength={12}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Enter your{' '}
                    {selectedMethod === 'orange'
                      ? 'Orange Money'
                      : 'MTN Mobile Money'}{' '}
                    number
                  </p>
                </div>
              </div>

              <div className='flex space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => setStep('method')}
                  className='flex-1'
                >
                  Back
                </Button>
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber.trim()}
                  className='flex-1'
                >
                  Pay Now
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className='text-center py-8'>
              <div className='w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground'></div>
              </div>
              <h3 className='text-lg font-semibold mb-2'>Processing Payment</h3>
              <p className='text-muted-foreground text-sm'>
                Please check your phone for the payment request...
              </p>
            </div>
          )}

          {step === 'success' && ticket && (
            <>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>
                  Payment Successful!
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Your ticket has been sent to your phone and email
                </p>
              </div>

              {/* Ticket Display */}
              <div className='bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white'>
                <div className='text-center mb-4'>
                  <h4 className='text-lg font-bold'>🎫 Your Ticket</h4>
                  <div className='text-sm opacity-90'>{ticket.gameTitle}</div>
                </div>

                <div className='bg-white/20 rounded-lg p-4 mb-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <div className='opacity-75'>Ticket Number</div>
                      <div className='font-mono font-bold text-xs'>
                        {ticket.ticketNumber}
                      </div>
                    </div>
                    <div>
                      <div className='opacity-75'>Price Paid</div>
                      <div className='font-bold'>
                        {currencyService.formatCurrency(
                          ticket.price,
                          ticket.currency
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='text-center'>
                  <img
                    src={ticket.qrCode}
                    alt='Ticket QR Code'
                    className='w-20 h-20 mx-auto bg-white rounded-lg p-1'
                  />
                  <div className='text-xs opacity-75 mt-2'>Scan to verify</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                <div className='grid grid-cols-3 gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={printTicket}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Printer className='w-4 h-4' />
                    <span className='text-xs'>Print</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => toast.success('Ticket sent to your email!')}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Mail className='w-4 h-4' />
                    <span className='text-xs'>Email</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={downloadTicket}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Download className='w-4 h-4' />
                    <span className='text-xs'>Save</span>
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    onClick={handlePlayAgain}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  >
                    Play Again 🎮
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => {
                      handleClose();
                      window.location.href = '/profile';
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
