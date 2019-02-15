import React from 'react';
import { Dimensions } from 'react-native';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import StickyContainer from 'recyclerlistview/dist/reactnative/core/StickyContainer';
import styled from 'styled-components/primitives/dist/styled-components-primitives.esm';
import PropTypes from 'prop-types';
import TransactionCoinRow from '../coin-row/TransactionCoinRow';
import ActivityListHeader from './ActivityListHeader';
import ListFooter from '../list/ListFooter';

const ViewTypes = {
  COMPONENT_HEADER: 0,
  FOOTER: 1,
  HEADER: 2,
  ROW: 3,
};

const Wrapper = styled.View`
  flex: 1;
  overflow: hidden;
  width: 100%;
`;

export default class RecyclerActivityList extends React.Component {
  static propTypes = {
    header: PropTypes.node,
    sections: PropTypes.arrayOf(PropTypes.shape({
      data: PropTypes.array,
      renderItem: PropTypes.func,
      title: PropTypes.string.isRequired,
    })),
  };

  constructor(args) {
    super(args);
    const { width } = Dimensions.get('window');
    this.state = {
      dataProvider: new DataProvider((r1, r2) => r1.hash !== r2.hash),
      headersIndices: [],
    };

    this.layoutProvider = new LayoutProvider(
      index => {
        if (index === 0) {
          return ViewTypes.COMPONENT_HEADER;
        }

        if (this.state.headersIndices.includes(index)) {
          return ViewTypes.HEADER;
        }

        if (this.state.headersIndices.includes(index + 1)) {
          return ViewTypes.FOOTER;
        }

        return ViewTypes.ROW;
      },
      (type, dim) => {
        // This values has been hardcoded for omitting imports' cycle
        dim.width = width;
        if (type === ViewTypes.ROW) {
          dim.height = 64;
        } else if (type === ViewTypes.FOOTER) {
          dim.height = 27;
        } else if (type === ViewTypes.HEADER) {
          dim.height = 35;
        } else {
          dim.height = 184;
        }
      },
    );
  }

  static getDerivedStateFromProps(props, state) {
    const headersIndices = [];
    const items = props.sections.reduce((ctx, section) => {
      headersIndices.push(ctx.length);
      return ctx
        .concat([{
          hash: section.title,
          title: section.title,
        }])
        .concat(section.data)
        .concat([{ hash: `${section.title}_end` }]); // footer
    }, [{ hash: '_header' }]); // header
    items.pop(); // remove last footer
    return {
      dataProvider: state.dataProvider.cloneWithRows(items),
      headersIndices,
    };
  }

  rowRenderer = (type, data) => {
    if (type === ViewTypes.COMPONENT_HEADER) {
      return this.props.header;
    }
    if (type === ViewTypes.HEADER) {
      return (
        <ActivityListHeader {...data}/>
      );
    }
    if (type === ViewTypes.FOOTER) {
      return (
        <ListFooter/>
      );
    }
    return (
      <TransactionCoinRow
        item={data}
      />
    );
  }

  render() {
    return (
      <Wrapper>
        <StickyContainer
          stickyHeaderIndices={this.state.headersIndices}
        >
          <RecyclerListView
            layoutProvider={this.layoutProvider}
            dataProvider={this.state.dataProvider}
            rowRenderer={this.rowRenderer}
            renderAheadOffset={1000}
          />
        </StickyContainer>
      </Wrapper>
    );
  }
}
