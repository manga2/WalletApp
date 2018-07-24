import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompact';
import { AssetList, BalanceCoinRow, UniqueTokenGridList } from '../components/asset-list';
import Avatar from '../components/Avatar';
import { ButtonPressAnimation } from '../components/buttons';
import { Header, Page } from '../components/layout';

const filterEmptyAssetSections = sections => sections.filter(({ totalItems }) => totalItems);

const sortAssetsByNativeAmount = assets =>
  assets.sort((a, b) => {
    const amountA = get(a, 'native.balance.amount', 0);
    const amountB = get(b, 'native.balance.amount', 0);
    return parseFloat(amountB) - parseFloat(amountA);
  });

const WalletScreen = ({
  accountInfo,
  onPressProfile,
  showShitcoins,
  uniqueTokens,
}) => {
  const sections = {
    balances: {
      data: sortAssetsByNativeAmount(accountInfo.assets),
      renderItem: BalanceCoinRow,
      showContextMenu: true,
      title: 'Balances',
      totalItems: sortAssetsByNativeAmount(accountInfo.assets).length,
      totalValue: accountInfo.total.display || '---',
    },
    collectibles: {
      data: [uniqueTokens],
      renderItem: UniqueTokenGridList,
      title: 'Collectibles',
      totalItems: uniqueTokens.length,
      totalValue: '',
    },
  };

  return (
    <Page>
      <Header>
        <ButtonPressAnimation onPress={onPressProfile}>
          <Avatar />
        </ButtonPressAnimation>
      </Header>
      <AssetList
        sections={filterEmptyAssetSections([sections.balances, sections.collectibles])}
        showShitcoins={showShitcoins}
      />
    </Page>
  );
};

WalletScreen.propTypes = {
  accountInfo: PropTypes.object.isRequired,
  fetching: PropTypes.bool.isRequired,
  fetchingUniqueTokens: PropTypes.bool.isRequired,
  onPressProfile: PropTypes.func.isRequired,
  showShitcoins: PropTypes.bool,
  uniqueTokens: PropTypes.array.isRequired,
};

const reduxProps = ({ account }) => ({
  accountInfo: account.accountInfo,
  fetching: account.fetching,
  fetchingUniqueTokens: account.fetchingUniqueTokens,
  uniqueTokens: account.uniqueTokens,
});

export default compose(
  withState('showShitcoins', 'toggleShowShitcoins', false),
  connect(reduxProps, null),
  withHandlers({
    onPressProfile: ({ navigation }) => () => navigation.navigate('SettingsScreen'),
    onToggleShowShitcoins: ({ showShitcoins, toggleShowShitcoins }) =>
      toggleShowShitcoins(!showShitcoins),
  }),
)(WalletScreen);
