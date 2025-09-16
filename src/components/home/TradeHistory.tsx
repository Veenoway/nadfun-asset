'use client';

import { useTradeHistoryOne } from '@/hooks';
import { formatMON, formatTokenBalance } from '@/lib/helpers';
import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isAddress } from 'viem';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@/components/ui';
import { SelectedToken } from './Home';

interface TradeHistoryProps {
  selectedTokens: SelectedToken[];
  activeTab: string;
}

const TradeHistory = ({ selectedTokens, activeTab }: TradeHistoryProps) => {
  const [tradeType, setTradeType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data } = useTradeHistoryOne(
    selectedTokens.find((st) => st.tabId === activeTab)?.token.token_info.token_id || '',
    page,
    limit,
    direction,
    tradeType,
  );

  const total = useMemo(() => data?.total, [data]);
  const trades = useMemo(() => data?.items, [data]);

  return (
    <div className="mt-3">
      <div className="col-span-12 lg:col-span-8 row-span-3 rounded-lg h-full">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {['All', 'Buy', 'Sell'].map((type) => (
              <Button
                variant="filter"
                size="filter"
                key={type}
                className={
                  tradeType === type.toUpperCase()
                    ? 'bg-brandColor text-white'
                    : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
                }
                onClick={() => setTradeType(type.toUpperCase() as 'ALL' | 'BUY' | 'SELL')}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="filter"
              size="filter"
              className={`${
                direction === 'ASC'
                  ? 'bg-brandColor text-white'
                  : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
              }`}
              onClick={() => setDirection('ASC')}
            >
              Asc
            </Button>
            <Button
              variant="filter"
              size="filter"
              className={`${
                direction === 'DESC'
                  ? 'bg-brandColor text-white'
                  : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
              }`}
              onClick={() => setDirection('DESC')}
            >
              Desc
            </Button>
          </div>
        </div>
        <div className="overflow-auto w-full" style={{ maxHeight: 'calc(100% - 95px)' }}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-t border-borderColor">
                <TableHead className="font-semibold text-white/60">Date</TableHead>
                <TableHead className="font-semibold text-white/60">User</TableHead>
                <TableHead className="font-semibold text-white/60">MON</TableHead>
                <TableHead className="font-semibold text-center text-white/60">
                  Token Amount
                </TableHead>
                <TableHead className="font-semibold text-right text-white/60">
                  Transaction Hash
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {trades?.map((trade: any) => {
                const token = selectedTokens.find(
                  (t) =>
                    t.token.token_info.token_id?.toLowerCase() === trade._address.toLowerCase(),
                );
                const tokenSymbol = token?.token.token_info.symbol ?? '';
                return (
                  <TableRow
                    key={trade._address + trade.created_at + trade.transaction_hash}
                    className="hover:bg-white/5 transition-colors border-b border-borderColor"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full font-medium text-[10px] px-1.5 py-[1px] ${
                            trade.is_buy
                              ? 'bg-green-600/30 text-green-500'
                              : 'bg-red-600/30 text-red-500'
                          }`}
                        >
                          {trade.is_buy ? 'Buy' : 'Sell'}
                        </div>
                        <div className="gap-2 text-xs">
                          <p className="text-white/60">
                            {' '}
                            {new Date(trade.created_at * 1000).toLocaleString('en-US', {
                              month: 'short',
                              day: '2-digit',
                            })}
                          </p>
                          <p className="text-white text-xs">
                            {new Date(trade.created_at * 1000).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={trade.account_info.image_uri}
                          alt={trade.account_info.nickname}
                          className="w-6 h-6 rounded-full ring-1 ring-white/10"
                        />
                        {isAddress(trade.account_info.nickname)
                          ? trade.account_info.nickname.slice(0, 3) +
                            trade.account_info.nickname.slice(-3)
                          : trade.account_info.nickname}
                      </div>
                    </TableCell>
                    <TableCell className={`${trade.is_buy ? 'text-green-500' : 'text-red-500'}`}>
                      {formatMON(trade.native_amount)}
                    </TableCell>

                    <TableCell
                      className={`text-center uppercase ${trade.is_buy ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatTokenBalance(trade.token_amount, true)} {tokenSymbol}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link
                        target="_blank"
                        href={`https://testnet.monadexplorer.com/tx/${trade.transaction_hash}`}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                      >
                        <span>
                          {trade.transaction_hash.slice(0, 6)}...
                          {trade.transaction_hash.slice(-4)}
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between mt-5 gap-2 items-center">
          <div className="text-sm text-white/60">Showing {total} trades</div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button
                variant="filter"
                size="filter"
                className={`border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out bg-secondary hover:bg-terciary text-white/60 hover:text-white`}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>
            )}
            <Button
              variant="filter"
              size="filter"
              className={`border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out bg-secondary hover:bg-terciary text-white/60 hover:text-white`}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
            <span className="text-sm text-white/60">
              {page} of {Math.ceil(total ?? 1 / limit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TradeHistory };
