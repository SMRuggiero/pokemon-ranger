import React, { useRef } from 'react';
import { NatureResult, RangeResult } from '../utils/calculations';
import { useGridCopy } from '../utils/hooks';
import { ResultsGrid, ResultsGridHeader, ResultsRow, ResultsSubheader } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';


interface ExpandedDisplayGridProps {
  name: string;
  rangeSegments: RangeResult[];
  displayRolls: boolean;
}

const ExpandedDisplayGrid: React.FC<ExpandedDisplayGridProps> = ({ name, rangeSegments, displayRolls }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useGridCopy(gridRef);

  return (
    <>
      <ResultsSubheader>{name}</ResultsSubheader>
      <ResultsGrid ref={gridRef}>
        <ResultsGridHeader>
          <div>IVs</div>
          <div>Stat</div>
          <div>Damage</div>
        </ResultsGridHeader>
        {rangeSegments.map(({ from, to, stat, damageValues, damageRangeOutput }) => (
          <React.Fragment key={`${from} - ${to}`}>
            <ResultsRow>
              <div>{from === to ? from : `${from}–${to}`}</div>
              <div>{stat}</div>
              <div>{damageRangeOutput}</div>
            </ResultsRow>
            {displayRolls && <ResultsDamageRow values={damageValues} />}
          </React.Fragment>
        ))}
      </ResultsGrid>
    </>
  );
};

interface ExpandedDisplayProps {
  results: NatureResult[];
  displayRolls: boolean;
}

export const ExpandedDisplay: React.FC<ExpandedDisplayProps> = ({ results, displayRolls }) => (
  <>
  {results.map(({ name, rangeSegments }) => (
      <ExpandedDisplayGrid
        key={name}
        name={name}
        rangeSegments={rangeSegments}
        displayRolls={displayRolls} />
    ))}
  </>
);