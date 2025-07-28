import React from 'react';

interface BanConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  confirmationData: any;
  participants: any[];
  onConfirm: (data: any) => void;
}

const BanConfirmationDialog = ({ isOpen, onClose, confirmationData, participants, onConfirm }: BanConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-confirmation-title"
      aria-describedby="ban-confirmation-description"
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ban-confirmation-title" className="text-xl font-semibold mb-4 text-[#19232d]">Confirm Ban</h2>
        <p id="ban-confirmation-description" className="sr-only">
          Confirm that you want to ban this user from the room
        </p>
        <div className="mb-4">
          <p className="text-[#19232d] mb-2">
            Are you sure you want to ban this user from the room?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            This action cannot be undone. The user will be immediately removed and prevented from rejoining.
          </p>
          {confirmationData && (
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="text-sm font-medium text-[#19232d]">User to ban:</p>
              <p className="text-sm text-gray-700">
                {(() => {
                  const participant = participants?.find((p: any) => p.userId === confirmationData.selectedBanUserId);
                  return participant?.name || (participant as any)?.user?.name || confirmationData.selectedBanUserId;
                })()}
              </p>
              {confirmationData.banReason && (
                <>
                  <p className="text-sm font-medium text-[#19232d] mt-2">Reason:</p>
                  <p className="text-sm text-gray-700">{confirmationData.banReason}</p>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
            onClick={onClose}
            aria-label="Cancel ban confirmation"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => onConfirm(confirmationData)}
            aria-label="Confirm ban action"
          >
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanConfirmationDialog; 