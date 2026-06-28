import { Trash } from 'lucide-react';

import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';
import { type Pagination } from '@/shared/types/blocks/common';
import { type TableColumn } from '@/shared/types/blocks/table';

import { Copy } from './copy';
import { Dropdown } from './dropdown';
import { Image } from './image';
import { JsonPreview } from './json-preview';
import { Label } from './label';
import { Time } from './time';
import { User } from './user';

export function Table({
  columns,
  data,
  emptyMessage,
  pagination,
}: {
  columns?: TableColumn[];
  data?: any[];
  emptyMessage?: string;
  pagination?: Pagination;
}) {
  if (!columns) {
    columns = [];
  }

  const getFixedActionClassName = (column: TableColumn) => {
    const isFixedActionColumn =
      column.type === 'dropdown' ||
      column.name === 'action' ||
      column.name === 'actionItems';

    if (!isFixedActionColumn) {
      return '';
    }

    return 'sticky right-0 z-10 border-l bg-card group-hover:bg-card';
  };

  const getFixedActionHeadClassName = (column: TableColumn) => {
    const isFixedActionColumn =
      column.type === 'dropdown' ||
      column.name === 'action' ||
      column.name === 'actionItems';

    if (!isFixedActionColumn) {
      return '';
    }

    return 'sticky right-0 z-20 border-l bg-card';
  };

  return (
    <TableComponent className="w-full">
      <TableHeader className="">
        <TableRow className="rounded-md">
          {columns &&
            columns.map((item: TableColumn, idx: number) => {
              return (
                <TableHead
                  key={idx}
                  className={cn(item.className, getFixedActionHeadClassName(item))}
                >
                  {item.title}
                </TableHead>
              );
            })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data.length > 0 ? (
          data.map((item: any, idx: number) => (
            <TableRow
              key={idx}
              className={cn('group h-16', item?.rowClassName || '')}
            >
              {columns &&
                columns.map((column: TableColumn, iidx: number) => {
                  const value = item[column.name as keyof typeof item];

                  const content = column.callback
                    ? column.callback(item)
                    : value;

                  let cellContent = content;

                  if (column.type === 'image') {
                    cellContent = (
                      <Image
                        alt={String(value || column.placeholder || '')}
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'time') {
                    cellContent = (
                      <Time
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'label') {
                    cellContent = (
                      <Label
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'copy' && value) {
                    cellContent = (
                      <Copy
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      >
                        {content}
                      </Copy>
                    );
                  } else if (column.type === 'dropdown') {
                    cellContent = (
                      <Dropdown
                        placeholder={column.placeholder}
                        value={content}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'user') {
                    cellContent = (
                      <User
                        placeholder={column.placeholder}
                        value={value}
                        metadata={column.metadata}
                        className={column.className}
                      />
                    );
                  } else if (column.type === 'json_preview') {
                    cellContent = (
                      <JsonPreview
                        placeholder={column.placeholder}
                        value={value}
                        metadata={{ ...(column.metadata || {}), title: column.title }}
                        className={column.className}
                      />
                    );
                  }

                  return (
                    <TableCell
                      key={iidx}
                      className={cn(column.className, getFixedActionClassName(column))}
                    >
                      {cellContent || column.placeholder}
                    </TableCell>
                  );
                })}
            </TableRow>
          ))
        ) : (
          <TableRow className="">
            <TableCell colSpan={columns.length}>
              <div className="text-muted-foreground flex w-full items-center justify-center py-8">
                {emptyMessage ? (
                  <p>{emptyMessage}</p>
                ) : (
                  <Trash className="h-10 w-10" />
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableComponent>
  );
}

export * from './table-card';
