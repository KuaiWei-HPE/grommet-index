// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Box from 'grommet/components/Box';
import Split from 'grommet/components/Split';
import Button from 'grommet/components/Button';
import FilterIcon from 'grommet/components/icons/base/Filter';
import Responsive from 'grommet/utils/Responsive';

import IndexPropTypes from '../utils/PropTypes';
import IndexTable from './Table';
import IndexTiles from './Tiles';
import IndexList from './List';
import IndexHeader from './Header';
import Filters from './Filters';
import Intl from 'grommet/utils/Intl';

const CLASS_ROOT = 'index';

const VIEW_COMPONENT = {
  list: IndexList,
  tiles: IndexTiles,
  table: IndexTable
};

export default class Index extends Component {

  constructor () {
    super();
    this._onResponsive = this._onResponsive.bind(this);
    this._toggleInlineFilter = this._toggleInlineFilter.bind(this);
    this.state = { responsiveSize: 'medium' };

  }

  componentDidMount () {
    this._responsive = Responsive.start(this._onResponsive);
  }

  componentWillUnmount () {
    this._responsive.stop();
  }

  _onResponsive (small) {
    this.setState({ responsiveSize: (small ? 'small' : 'medium') });
  }

  _toggleInlineFilter() {
    this.setState({
      inlineFilterOpen: !this.state.inlineFilterOpen
    });
  }

  render () {
    const { result, notifications } = this.props;
    let { data } = this.props;

    if (result) {
      console.warn('\'result\' prop has been renamed to \'data.\'' +
        ' Support for \'result\' will be removed in a future release.');
      data = result;
    }

    var classes = [CLASS_ROOT];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    let error;
    if (data && data.error) {
      error = (
        <div className={`${CLASS_ROOT}__error`}>
          {result.error}
        </div>
      );
    }

    let empty;
    if (data) {
      let emptyMessage;
      let addControl;
      if (data.unfilteredTotal === 0) {
        emptyMessage = this.props.emptyMessage;
        if (this.props.emptyAddControl) {
          addControl = this.props.emptyAddControl;
        } else {
          addControl = this.props.addControl;
        }
      } else if (data.total === 0) {
        emptyMessage = Intl.getMessage(this.context.intl, 'No matches');
      }
      if (emptyMessage) {
        empty = (
          <Box className={`${CLASS_ROOT}__empty`}
            pad={{horizontal: 'medium', vertical: 'large', between: 'medium'}}
            justify="center" align="center">
            <span className="secondary">{emptyMessage}</span>
            {addControl}
          </Box>
        );
      }
    }

    let view = this.props.view;
    let itemComponent = this.props.itemComponent;
    if (typeof view === 'object') {
      view = view[this.state.responsiveSize];
    }
    if (typeof itemComponent === 'object') {
      itemComponent = itemComponent[this.state.responsiveSize];
    }
    const ViewComponent = VIEW_COMPONENT[view];

    let filterControl;
    let { filtersInline } = this.props;
    const { inlineFilterOpen } = this.state;

    // mobile view doesn't get inline filter
    filtersInline = filtersInline && this.state.responsiveSize !== 'small';

    if (filtersInline && !inlineFilterOpen) {
      // only show the filterControl if the sidebar is closed
      const selectedFilterCount = Object.keys(this.props.filter).length;
      filterControl = (
        <Button
          icon={<FilterIcon colorIndex={selectedFilterCount ? 'brand' : undefined}/>}
          plain={true}
          onClick={this._toggleInlineFilter} />
      );
    } else if (!filtersInline) {
      filterControl = (
        <Filters
          attributes={this.props.attributes}
          data={data}
          values={this.props.filter}
          sort={this.props.sort}
          onChange={this.props.onFilter}
          onSort={this.props.onSort} />
      );
    }

    return (
      <div className={classes.join(' ')}>
        <div className={`${CLASS_ROOT}__container`}>
          <Split flex="left" priority="left" fixed={true}>
            <div>
              <IndexHeader className={`${CLASS_ROOT}__header`}
                label={this.props.label}
                attributes={this.props.attributes}
                filterType={this.props.filterType}
                filterDirection={this.props.filterDirection}
                filter={this.props.filter} onFilter={this.props.onFilter}
                query={this.props.query} onQuery={this.props.onQuery}
                sort={this.props.sort} onSort={this.props.onSort}
                data={data}
                fixed={this.props.fixed}
                addControl={this.props.addControl}
                navControl={this.props.navControl}
                filterControl={filterControl} />
              {error}
              {notifications}
              <div ref="items" className={`${CLASS_ROOT}__items`}>
                <ViewComponent
                  actions={this.props.actions}
                  attributes={this.props.attributes}
                  fill={this.props.fill}
                  flush={this.props.flush}
                  itemComponent={itemComponent}
                  data={data}
                  sections={this.props.sections}
                  selection={this.props.selection}
                  size={this.props.size}
                  sort={this.props.sort}
                  onSelect={this.props.onSelect}
                  onMore={this.props.onMore} />
                {empty}
              </div>
            </div>
            {filtersInline && inlineFilterOpen &&
              <Filters
                inline={true}
                attributes={this.props.attributes}
                data={data}
                values={this.props.filter}
                sort={this.props.sort}
                onClose={this._toggleInlineFilter}
                onChange={this.props.onFilter}
                onSort={this.props.onSort}/>
            }
          </Split>
        </div>
      </div>
    );
  }

}

Index.propTypes = {
  actions: PropTypes.element,
  addControl: PropTypes.node,
  attributes: IndexPropTypes.attributes,
  data: IndexPropTypes.data,
  emptyMessage: PropTypes.node,
  emptyAddControl: PropTypes.node,
  fill: PropTypes.bool, // for Tiles
  filter: PropTypes.object, // { name: [value, ...] }
  filterDirection: PropTypes.oneOf(['row', 'column']),
  fixed: PropTypes.bool,
  flush: PropTypes.bool, // for Tiles
  itemComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      medium: PropTypes.func,
      small: PropTypes.func
    })
  ]),
  label: PropTypes.string,
  navControl: PropTypes.node,
  notifications: PropTypes.node,
  onFilter: PropTypes.func, // (filter)
  onMore: PropTypes.func,
  onQuery: PropTypes.func, // (query)
  onSelect: PropTypes.func,
  onSort: PropTypes.func, // (sort)
  query: PropTypes.object, // Query
  selection: PropTypes.oneOfType([
    PropTypes.string, // uri
    PropTypes.arrayOf(PropTypes.string)
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  sort: PropTypes.string,
  view: PropTypes.oneOfType([
    PropTypes.oneOf(["table", "tiles", "list"]),
    PropTypes.shape({
      medium: PropTypes.oneOf(["table", "tiles", "list"]),
      small: PropTypes.oneOf(["table", "tiles", "list"])
    })
  ])
};

Index.defaultProps = {
  attributes: [{name: 'name', label: 'Name', index: 0}],
  filterDirection: 'column',
  fixed: true,
  flush: true,
  view: "tiles"
};

Index.contextTypes = {
  intl: PropTypes.object
};
