import React from 'react'

import { AddressModal } from 'components'

import { useDisclosure, useUserInfo } from 'hooks'

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

      {!isVerify ? null : !isLoading ? (
        <AddressModal
          isShow={isShowAddressModal}
          onClose={addressModalHandlers.close}
          address={userInfo?.address ?? {}}
        />
      ) : null}
    </>
  )
}

export default WithAddressModal
