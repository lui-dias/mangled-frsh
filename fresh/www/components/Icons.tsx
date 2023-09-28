export function IconMinus() {
  return (
    <svg
      class="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 12H4"
      />
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg
      class="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}

export function Leaf() {
  return (
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#fff" d="M0 0h24v24H0z" />
      <path
        d="M2 10.276c.862-2.673 2.155-5.259 5.603-5.69"
        stroke="#6BA377"
        stroke-width="1.724"
      />
      <path
        d="M19.091 5.146c-4.44-5.697-10.945-2.374-13.643 0 2.081-1.662 3.006 4.747 4.163 9.733.925 3.987 8.71 6.409 12.486 7.121.848-3.244 1.434-11.157-3.006-16.854Z"
        fill="#25D24B"
      />
    </svg>
  );
}

export function Copy() {
  return (
    <svg
      class="h-4 w-4"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.55566 2.7C1.55566 2.03726 2.09292 1.5 2.75566 1.5H8.75566C9.41841 1.5 9.95566 2.03726 9.95566 2.7V5.1H12.3557C13.0184 5.1 13.5557 5.63726 13.5557 6.3V12.3C13.5557 12.9627 13.0184 13.5 12.3557 13.5H6.35566C5.69292 13.5 5.15566 12.9627 5.15566 12.3V9.9H2.75566C2.09292 9.9 1.55566 9.36274 1.55566 8.7V2.7ZM6.35566 9.9V12.3H12.3557V6.3H9.95566V8.7C9.95566 9.36274 9.41841 9.9 8.75566 9.9H6.35566ZM8.75566 8.7V2.7L2.75566 2.7V8.7H8.75566Z"
        fill="currentColor"
      />
    </svg>
  );
}

// from https://heroicons.com/
export function Check() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-width={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// from https://heroicons.com/
export function Info() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function GitHub(props: { class?: string }) {
  return (
    <svg
      class={`h-6 w-6 ${props.class ?? ""}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Discord(props: { class?: string }) {
  return (
    <svg
      class={`h-6 w-6 ${props.class ?? ""}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.16 4.50747C18.5996 3.79309 16.9523 3.28628 15.2603 3C15.0287 3.41393 14.8192 3.8398 14.6326 4.27584C12.8302 4.00424 10.9973 4.00424 9.19488 4.27584C9.00819 3.83984 8.79868 3.41398 8.56723 3C6.87405 3.2887 5.22569 3.79671 3.66374 4.51121C0.56287 9.099 -0.277728 13.5729 0.142571 17.9832C1.95852 19.3249 3.99108 20.3453 6.15191 21C6.63846 20.3456 7.069 19.6514 7.43896 18.9247C6.73628 18.6622 6.05807 18.3384 5.41219 17.957C5.58217 17.8337 5.74842 17.7067 5.90907 17.5834C7.78846 18.4673 9.83971 18.9255 11.9165 18.9255C13.9934 18.9255 16.0446 18.4673 17.924 17.5834C18.0865 17.7161 18.2528 17.8431 18.4209 17.957C17.7738 18.339 17.0943 18.6635 16.3904 18.9265C16.7599 19.6529 17.1905 20.3466 17.6774 21C19.8401 20.3479 21.8742 19.328 23.6905 17.9851C24.1837 12.8705 22.848 8.43773 20.16 4.50747ZM7.97134 15.2709C6.80011 15.2709 5.83248 14.208 5.83248 12.9004C5.83248 11.5928 6.76648 10.5205 7.9676 10.5205C9.16872 10.5205 10.1289 11.5928 10.1083 12.9004C10.0878 14.208 9.16499 15.2709 7.97134 15.2709ZM15.8617 15.2709C14.6886 15.2709 13.7248 14.208 13.7248 12.9004C13.7248 11.5928 14.6588 10.5205 15.8617 10.5205C17.0647 10.5205 18.0174 11.5928 17.9969 12.9004C17.9763 14.208 17.0554 15.2709 15.8617 15.2709Z"
      />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.0833 14.4167L16.9166 10.5834C16.9999 10.5 17.0588 10.4098 17.0933 10.3125C17.1283 10.2153 17.1458 10.1112 17.1458 10C17.1458 9.88893 17.1283 9.78476 17.0933 9.68754C17.0588 9.59032 16.9999 9.50004 16.9166 9.41671L13.0624 5.56254C12.9096 5.40976 12.7221 5.33337 12.4999 5.33337C12.2777 5.33337 12.0833 5.41671 11.9166 5.58337C11.7638 5.73615 11.6874 5.9306 11.6874 6.16671C11.6874 6.40282 11.7638 6.59726 11.9166 6.75004L14.3333 9.16671H3.33325C3.09714 9.16671 2.89936 9.24643 2.73992 9.40587C2.57992 9.56587 2.49992 9.76393 2.49992 10C2.49992 10.2362 2.57992 10.4339 2.73992 10.5934C2.89936 10.7534 3.09714 10.8334 3.33325 10.8334H14.3333L11.8958 13.2709C11.743 13.4237 11.6666 13.6112 11.6666 13.8334C11.6666 14.0556 11.7499 14.25 11.9166 14.4167C12.0694 14.5695 12.2638 14.6459 12.4999 14.6459C12.736 14.6459 12.9305 14.5695 13.0833 14.4167Z"
        fill="currentColor"
      />
    </svg>
  );
}