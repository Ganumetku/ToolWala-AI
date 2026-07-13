import { EditingSession } from '../src/lib/tw-engine/editing/EditingSession';
import { KeyboardController } from '../src/lib/tw-engine/editing/KeyboardController';

async function runCaretNavigationVerification() {
  console.log('=== Starting Caret & Keyboard Navigation Verification ===');

  try {
    const session = EditingSession.getInstance();
    const testText = 'Hello ToolWala MultiLine\nSecond Line of text';
    
    // 1. Start session
    session.startSession('text-1', 1, testText);
    console.log(`Initial text: "${session.getText()}"`);
    console.log(`Initial caret: ${session.getCaretIndex()} | Anchor: ${session.getSelectionAnchor()}`);

    if (session.getCaretIndex() !== testText.length) {
      throw new Error('Initial caret should be at end of text');
    }

    // 2. Home key navigation
    console.log('\nTesting Home key...');
    const homeEvent = { key: 'Home', preventDefault: () => {} } as KeyboardEvent;
    KeyboardController.getInstance().handleKeyDown(homeEvent);
    console.log(`Caret after Home: ${session.getCaretIndex()} | Anchor: ${session.getSelectionAnchor()}`);
    // Start of the second line in "Hello ToolWala MultiLine\nSecond Line of text" is 25
    if (session.getCaretIndex() !== 25) {
      throw new Error(`Expected caret to be at index 25, got ${session.getCaretIndex()}`);
    }

    // 3. ArrowRight word jump (Ctrl/Cmd)
    console.log('\nTesting Ctrl+ArrowRight word jump...');
    const rightCtrlEvent = { key: 'ArrowRight', ctrlKey: true, preventDefault: () => {} } as KeyboardEvent;
    KeyboardController.getInstance().handleKeyDown(rightCtrlEvent);
    console.log(`Caret after Ctrl+ArrowRight: ${session.getCaretIndex()} | Anchor: ${session.getSelectionAnchor()}`);
    // Jump over "Second" -> index should be 31
    if (session.getCaretIndex() !== 31) {
      throw new Error(`Expected caret to be at index 31, got ${session.getCaretIndex()}`);
    }

    // 4. Shift + ArrowLeft selection extension
    console.log('\nTesting Shift+ArrowLeft selection extension...');
    const leftShiftEvent = { key: 'ArrowLeft', shiftKey: true, preventDefault: () => {} } as KeyboardEvent;
    KeyboardController.getInstance().handleKeyDown(leftShiftEvent);
    console.log(`Selection range: [${session.getSelectionStart()}, ${session.getSelectionEnd()}] | Caret: ${session.getCaretIndex()} | Anchor: ${session.getSelectionAnchor()}`);
    // Anchor remains 31, Caret goes to 30. Selection should be [31, 30] (or sorted as [30, 31])
    if (session.getSelectionStart() !== 31 || session.getSelectionEnd() !== 30) {
      throw new Error('Selection extension boundaries failed');
    }

    console.log('\n🎉 ALL CARET NAVIGATION CHECKS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('Caret verification failed:', error);
    process.exit(1);
  }
}

runCaretNavigationVerification();
