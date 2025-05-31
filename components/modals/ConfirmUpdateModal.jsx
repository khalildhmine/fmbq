import { Button } from '../common/Buttons'
import Modal from '../common/Modal'

const ConfirmUpdateModal = ({ isOpen, isLoading, onClose, onConfirm, onCancel }) => {
  return (
    <Modal isShow={isOpen} onClose={onClose} effect="ease-out">
      <Modal.Content onClose={onClose}>
        <Modal.Body>
          <div className="px-6 py-8 space-y-6 text-center bg-white md:rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Confirm Update</h3>
            <p className="text-gray-500">
              Are you sure you want to update this product? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-x-4">
              <Button
                onClick={onCancel}
                type="button"
                variant="outline"
                className="w-32"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={onConfirm}
                type="button"
                variant="primary"
                className="w-32"
                isLoading={isLoading}
              >
                Update
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

export default ConfirmUpdateModal
