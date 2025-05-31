'use client'

import React, { Suspense } from 'react'
import AddressModal from '@/components/modals/AddressModal'
import { useDisclosure, useUserInfo } from 'hooks'

const AddressModalWrapper = ({ isShowAddressModal, addressModalHandlers, userInfo }) => {
  if (!userInfo?.isVerify || userInfo?.isLoading) return null

  return (
    <AddressModal
      isShow={isShowAddressModal}
      onClose={addressModalHandlers.close}
      address={userInfo?.address ?? {}}
    />
  )
}

const WithAddressModal = props => {
  const { children } = props
  const [isShowAddressModal, addressModalHandlers] = useDisclosure()
  const { userInfo, isVerify, isLoading } = useUserInfo()

  const addressModalProps = {
    openAddressModal: addressModalHandlers.open,
    address: userInfo?.address ?? {},
    isLoading,
    isVerify,
    isAddress: !!userInfo?.address,
  }

  const handleSubmit = async values => {
    const formattedAddress = {
      province: {
        code: values.province.code,
        name: values.province.name,
      },
      city: {
        code: values.city.code,
        name: values.city.name,
      },
      area: {
        code: values.area.code,
        name: values.area.name,
      },
      street: values.street,
      postalCode: values.postalCode,
    }
    // ...rest of code
  }

  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              addressModalProps,
            })
          : child
      )}

      <Suspense fallback={null}>
        <AddressModalWrapper
          isShowAddressModal={isShowAddressModal}
          addressModalHandlers={addressModalHandlers}
          userInfo={{ ...userInfo, isVerify, isLoading }}
        />
      </Suspense>
    </>
  )
}

export default WithAddressModal
