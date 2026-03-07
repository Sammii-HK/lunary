const React = require('react');
const Turnstile = ({ onSuccess }) => {
  React.useEffect(() => {
    if (onSuccess) onSuccess('mock-turnstile-token');
  }, [onSuccess]);
  return null;
};
module.exports = { Turnstile };
