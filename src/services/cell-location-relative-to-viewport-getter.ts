import { Injectable } from '@angular/core';
import { SpreadsheetState } from '../spreadsheet/spreadsheet-state';
import { CellLocation } from '../model';

@Injectable()
export class CellLocationRelativeToViewportGetter {

  constructor(private spreadsheetState: SpreadsheetState) { }

  get(spreadsheetState: SpreadsheetState, targetCellLocation: CellLocation) {
    if (spreadsheetState == null) {
      spreadsheetState = this.spreadsheetState;
    }
    var targetCellPositionInformation = spreadsheetState.columnPositionInformationMap[targetCellLocation.columnIndex];
    var scrollTop = spreadsheetState.scrollTop;
    var bodyHeight = spreadsheetState.bodyHeight;
    var targetColumn = spreadsheetState.spreadsheetColumnList.find(c => c.index === targetCellLocation.columnIndex);
    if (targetColumn == null) {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        isOutsideViewport: false,
        isOutsideViewportHorizontally: false,
        isOutsideViewportVertically: false,
      };
    }
    var sectionPositionInformation = spreadsheetState.spreadsheetSectionPositionInformationMap[targetColumn.sectionName];
    var width = sectionPositionInformation.width;
    var scrollLeft = spreadsheetState.spreadsheetSectionScrollLeftMap[targetColumn.sectionName];
    var rowHeight = spreadsheetState.dataRowHeight;

    var viewport = {
      bottom: scrollTop + bodyHeight,
      left: scrollLeft,
      right: width + scrollLeft,
      top: scrollTop,
    };

    var target = {
      bottom: (targetCellLocation.rowIndex + 1) * rowHeight,
      left: targetCellPositionInformation.left,
      right: (targetCellPositionInformation.left + targetCellPositionInformation.width),
      top: (targetCellLocation.rowIndex - 1) * rowHeight,
    };

    var relative = {
      top: target.top - viewport.top,
      bottom: target.bottom - viewport.bottom,
      left: target.left - viewport.left,
      right: target.right - viewport.right,
      isOutsideViewport: false,
      isOutsideViewportHorizontally: false,
      isOutsideViewportVertically: false,
    };
    var isLeftBorderInsideViewport = relative.left >= 0;
    var isRightBorderInsideViewport = relative.right <= 0;
    var isHorizontalCenterInsideViewport = relative.left <= 0 && relative.right >= 0;
    var isColumnGreaterThanViewport = targetCellPositionInformation.width > width;
    if (isColumnGreaterThanViewport) {
      relative.isOutsideViewportHorizontally = !isHorizontalCenterInsideViewport && !isLeftBorderInsideViewport && !isRightBorderInsideViewport;
    } else {
      relative.isOutsideViewportHorizontally = !isLeftBorderInsideViewport || !isRightBorderInsideViewport;
    }

    relative.isOutsideViewportVertically = !(relative.top < 0 && relative.bottom > 0) && (relative.top < 0 || relative.bottom > 0);
    relative.isOutsideViewport = relative.isOutsideViewportHorizontally || relative.isOutsideViewportVertically;

    return relative;
  }

}