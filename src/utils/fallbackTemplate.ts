export function getDefaultDialogTemplate() {
  const htmlString = `
    <dialog id="dialogContainer">
      <div class="dialog-content">
        <div class="dialog-header">
          <button data-close class="dialog-close">&times;</button>
        </div>
        <div class="dialog-body">
          <p data-prompt class="dialog-prompt"></p>
          <div data-buttons class="dialog-buttons">
            </div>
          </div>
          <div class="dialog-footer" data-options></div>
        </div>
      </dialog>
    `;
  const styleString = `
        #dialogContainer {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0;
          width: 400px;
        }
        .dialog-content { padding: 20px; }
        .dialog-header { text-align: right; margin-bottom: 10px; }
        .dialog-close { background: none; border: none; font-size: 18px; cursor: pointer; }
        .dialog-body { display: flex; flex-direction: column; align-items: center; }
        .dialog-footer { display: flex; gap: 10px; justify-content: flex-end; }
        .display-buttons { display: flex; justify-content: flex-end; width: 100%; gap: 5px; }
        .dialog-button {
          padding: 8px 16px;
          border: 1px solid #007bff;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .dialog-button:hover { background: #0056b3; }
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.8);
        }
    `;
  return {
    htmlString,
    styleString
  };
}