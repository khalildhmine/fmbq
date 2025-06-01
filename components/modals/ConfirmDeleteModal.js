'use client'

import { Button } from '@/components/ui/button'
import Modal from '@/components/common/Modal'

export default function ConfirmDeleteModal(props) {
  //? Props
  const { title, isLoading, isShow, onClose, onCancel, onConfirm } = props

  //? Render(s)
  return (
    <>
      <Modal isShow={isShow} onClose={onClose} effect="ease-out">
        <Modal.Content onClose={onClose}>
          <Modal.Body>
            <div className="px-3 py-6 space-y-4 text-center bg-white md:rounded-lg">
              <p>
                确定删除<span className="font-bold text-red-500">{title}</span>吗？
              </p>
              <div className="flex justify-center gap-x-20">
                <Button onClick={onConfirm} isLoading={isLoading} variant="danger">
                  确定
                </Button>

                <Button onClick={onCancel} variant="success">
                  取消
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}
