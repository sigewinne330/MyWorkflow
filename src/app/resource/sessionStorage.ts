// utils/sessionStorage.ts
export const getSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') { // 仅在客户端执行
      return sessionStorage.getItem(key);
    }
    return null;
  };
  
  export const setSessionStorage = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  
  export const removeSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  };