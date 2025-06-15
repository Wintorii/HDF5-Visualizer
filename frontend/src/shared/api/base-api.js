export const handleResponse = (resolve) => {
  return (response) => {
    resolve(response);
  };
};


export const handleError = (reject) => {
  return (error) => {
    reject(error);

    if (error.response?.status === 403) {
      logout();
    }
  };
};