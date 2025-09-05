import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Address } from '@/types';
import { MapPin, Phone, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateAddress, useUpdateAddress } from '../api/mutations';

interface AddressFormProps {
  address?: Address;
  onClose: () => void;
  onSuccess?: (address: Address) => void;
}

const AddressForm = React.memo<AddressFormProps>(
  ({ address, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
      fullName: address?.fullName || '',
      phoneNumber: address?.phoneNumber || '',
      streetAddress: address?.streetAddress || '',
      city: address?.city || '',
      state: address?.state || '',
      postalCode: address?.postalCode || '',
      country: address?.country || 'Cameroon',
      additionalInfo: address?.additionalInfo || '',
      type: address?.type || ('HOME' as const),
      isDefault: address?.isDefault || false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.fullName.trim()) {
        newErrors.fullName = t('addressForm.errors.fullNameRequired');
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = t('addressForm.errors.phoneRequired');
      } else if (!/^\+237[0-9]{9}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = t('addressForm.errors.phoneInvalid');
      }

      if (!formData.streetAddress.trim()) {
        newErrors.streetAddress = t('addressForm.errors.streetRequired');
      }

      if (!formData.city.trim()) {
        newErrors.city = t('addressForm.errors.cityRequired');
      }

      if (!formData.state.trim()) {
        newErrors.state = t('addressForm.errors.stateRequired');
      }

      if (!formData.postalCode.trim()) {
        newErrors.postalCode = t('addressForm.errors.postalCodeRequired');
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.id) return;
      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        let savedAddress: Address;

        if (address) {
          // Update existing address
          savedAddress = await updateAddressMutation.mutateAsync({
            addressId: address.id,
            updates: formData,
          });
        } else {
          // Create new address
          savedAddress = await createAddressMutation.mutateAsync({
            ...formData,
            userId: user?.id,
          });
        }

        onSuccess?.(savedAddress);
        onClose();
      } catch (error) {
        console.error('Address save error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const cameroonStates = [
      'Adamawa',
      'Centre',
      'East',
      'Far North',
      'Littoral',
      'North',
      'Northwest',
      'South',
      'Southwest',
      'West',
    ];

    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
        <div className='bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-white'>
              {address ? t('addressForm.editTitle') : t('addressForm.addTitle')}
            </h2>
            <Button
              variant='ghost'
              onClick={onClose}
              className='text-gray-400 hover:text-white p-2'
            >
              <X className='w-5 h-5' />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Address Type */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                {t('addressForm.type')}
              </label>
              <div className='flex space-x-4'>
                {[
                  {
                    value: 'HOME',
                    label: t('addressForm.types.home'),
                    icon: '🏠',
                  },
                  {
                    value: 'WORK',
                    label: t('addressForm.types.work'),
                    icon: '🏢',
                  },
                  {
                    value: 'OTHER',
                    label: t('addressForm.types.other'),
                    icon: '📍',
                  },
                ].map(type => (
                  <button
                    key={type.value}
                    type='button'
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-orange-600 bg-orange-900/20 text-orange-400'
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className='text-sm'>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-white mb-2'>
                  <User className='w-4 h-4 inline mr-1' />
                  {t('addressForm.fullName')} *
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder={t('addressForm.placeholders.fullName')}
                />
                {errors.fullName && (
                  <p className='text-red-400 text-sm mt-1'>{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-white mb-2'>
                  <Phone className='w-4 h-4 inline mr-1' />
                  {t('addressForm.phoneNumber')} *
                </label>
                <input
                  type='tel'
                  value={formData.phoneNumber}
                  onChange={e =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.phoneNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder='+237123456789'
                />
                {errors.phoneNumber && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                <MapPin className='w-4 h-4 inline mr-1' />
                {t('addressForm.streetAddress')} *
              </label>
              <input
                type='text'
                value={formData.streetAddress}
                onChange={e =>
                  handleInputChange('streetAddress', e.target.value)
                }
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.streetAddress
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-orange-500'
                }`}
                placeholder={t('addressForm.placeholders.streetAddress')}
              />
              {errors.streetAddress && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.streetAddress}
                </p>
              )}
            </div>

            {/* City, State, Postal Code */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-white mb-2'>
                  {t('addressForm.city')} *
                </label>
                <input
                  type='text'
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.city
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder={t('addressForm.placeholders.city')}
                />
                {errors.city && (
                  <p className='text-red-400 text-sm mt-1'>{errors.city}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-white mb-2'>
                  {t('addressForm.state')} *
                </label>
                <select
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    errors.state
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                >
                  <option value=''>{t('addressForm.selectState')}</option>
                  {cameroonStates.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className='text-red-400 text-sm mt-1'>{errors.state}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-white mb-2'>
                  {t('addressForm.postalCode')} *
                </label>
                <input
                  type='text'
                  value={formData.postalCode}
                  onChange={e =>
                    handleInputChange('postalCode', e.target.value)
                  }
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.postalCode
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  placeholder='1000'
                />
                {errors.postalCode && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                {t('addressForm.country')}
              </label>
              <input
                type='text'
                value={formData.country}
                onChange={e => handleInputChange('country', e.target.value)}
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500'
                placeholder='Cameroon'
              />
            </div>

            {/* Additional Info */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                {t('addressForm.additionalInfo')} ({t('addressForm.optional')})
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={e =>
                  handleInputChange('additionalInfo', e.target.value)
                }
                rows={3}
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none'
                placeholder={t('addressForm.placeholders.additionalInfo')}
              />
            </div>

            {/* Default Address Checkbox */}
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='isDefault'
                checked={formData.isDefault}
                onChange={e => handleInputChange('isDefault', e.target.checked)}
                className='w-4 h-4 text-orange-600 bg-gray-700 border border-gray-600 rounded focus:ring-orange-500 focus:ring-2'
              />
              <label htmlFor='isDefault' className='ml-2 text-sm text-gray-300'>
                {t('addressForm.setAsDefault')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className='flex space-x-4 pt-6'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    {address
                      ? t('addressForm.updating')
                      : t('addressForm.saving')}
                  </div>
                ) : address ? (
                  t('addressForm.updateAddress')
                ) : (
                  t('addressForm.saveAddress')
                )}
              </Button>

              <Button
                type='button'
                onClick={onClose}
                variant='outline'
                className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-700'
              >
                {t('addressForm.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

AddressForm.displayName = 'AddressForm';

export default AddressForm;
