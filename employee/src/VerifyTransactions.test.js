import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VerifyTransactions from './Pages/VerifyTransactions';
import { MemoryRouter } from 'react-router-dom';

describe('VerifyTransactions Component', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test('renders pending and verified transactions', async () => {
    const mockTransactions = [
      { ID: 1, Amount: 100, Currency: 'USD', Provider: 'Bank', SWIFTCode: 'ABC123', CreatedAt: '2023-10-01T00:00:00Z', Verified: false },
      { ID: 2, Amount: 200, Currency: 'EUR', Provider: 'Bank', SWIFTCode: 'DEF456', CreatedAt: '2023-10-02T00:00:00Z', Verified: true },
    ];

    await act(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTransactions),
      });

      render(
        <MemoryRouter>
          <VerifyTransactions />
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByText(/Pending Verification/i)).toBeInTheDocument());

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  test('handles verify action', async () => {
    const mockTransactions = [
      { ID: 1, Amount: 100, Currency: 'USD', Provider: 'Bank', SWIFTCode: 'ABC123', CreatedAt: '2023-10-01T00:00:00Z', Verified: false },
    ];

    await act(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTransactions),
      });

      render(
        <MemoryRouter>
          <VerifyTransactions />
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByTestId('verify-button-1')).toBeInTheDocument());

    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(''),
    });

    fireEvent.click(screen.getByTestId('verify-button-1'));

    await waitFor(() => expect(screen.getByText(/Transaction 1 verified successfully/i)).toBeInTheDocument());
  });
});
