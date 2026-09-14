interface GoogleCredentialResponse {
  credential: string
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          error_callback?: (error: { type?: string }) => void;
        }) => void
        renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string; shape?: 'rectangular' | 'pill'; logo_alignment?: 'left' | 'center' }) => void
      }
    }
  }
}
