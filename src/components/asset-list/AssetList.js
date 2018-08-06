import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { SectionList } from 'react-native';
import { compose, withProps } from 'recompact';
import styled from 'styled-components/primitives';
import { withSafeAreaViewInsetValues } from '../../hoc';
import { position } from '../../styles';
import { FabWrapper, FloatingActionButton, WalletConnectFab } from '../fab';
import AssetListHeader from './AssetListHeader';
import AssetListItem from './AssetListItem';
import AssetListFooter from './AssetListFooter';
import AssetListSkeleton from './AssetListSkeleton';

const Container = styled.View`
  flex: 1;
`;

const List = styled(SectionList)`
  ${position.size('100%')}
`;

const buildListBottomPadding = (safeAreaInset) => {
  const fabSizeWithPadding = FloatingActionButton.size + (FabWrapper.bottomPosition * 2);
  return (safeAreaInset.bottom + fabSizeWithPadding) - AssetListFooter.height;
};

const keyExtractor = (item, index) => {
  const key = Array.isArray(item) ? item[0] : get(item, 'symbol');
  return key + index;
};

const AssetList = ({
  isEmpty,
  safeAreaInset,
  sections,
  onPressWalletConnect,
  ...props
}) => (
  <Container>
    <FabWrapper
      items={[(
        <WalletConnectFab
          disabled={isEmpty}
          key="walletConnectFab"
          onPress={onPressWalletConnect}
        />
      )]}
    >
      {isEmpty ? (
        <AssetListSkeleton />
      ) : (
        <List
          contentContainerStyle={{
            // We want to add enough spacing below the list so that when the user scrolls to the bottom,
            // the bottom of the list content lines up with the top of the FABs (+ padding).
            paddingBottom: buildListBottomPadding(safeAreaInset),
          }}
          keyExtractor={keyExtractor}
          renderItem={AssetListItem}
          renderSectionFooter={AssetListFooter}
          renderSectionHeader={headerProps => <AssetListHeader {...headerProps} />}
          scrollIndicatorInsets={{
            bottom: buildListBottomPadding(safeAreaInset) + AssetListFooter.height,
            top: AssetListHeader.height,
          }}
          sections={sections}
        />
      )}
    </FabWrapper>
  </Container>
);

AssetList.propTypes = {
  isEmpty: PropTypes.bool,
  safeAreaInset: PropTypes.object,
  onPressWalletConnect: PropTypes.func,
  sections: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
  withSafeAreaViewInsetValues,
  withProps(({ sections }) => {
    let isEmpty = true;

    for (let i = 0; i < sections.length; i += 1) {
      if (!isEmpty) break;
      isEmpty = !sections[i].totalItems;
    }

    return { isEmpty };
  }),
)(AssetList);
