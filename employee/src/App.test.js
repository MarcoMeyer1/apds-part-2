import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /Login/i });
  expect(headingElement).toBeInTheDocument();
});
