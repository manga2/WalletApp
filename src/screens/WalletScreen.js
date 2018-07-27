import lang from 'i18n-js';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { compose, onlyUpdateForKeys, withHandlers, withState } from 'recompact';
import { AssetList, UniqueTokenRow } from '../components/asset-list';
import Avatar from '../components/Avatar';
import { BalanceCoinRow } from '../components/coin-row';
import { ActivityHeaderButton, Header, HeaderButton } from '../components/header';
import { FlexItem, Page } from '../components/layout';
import {
  buildUniqueTokenList,
  groupAssetsByMarketValue,
  sortAssetsByNativeAmount,
} from '../helpers/assets';
import {
  withAccountAddress,
  withAccountAssets,
  withHideSplashScreenOnMount,
} from '../hoc';
import { position } from '../styles';

const BalanceRenderItem = renderItemProps => <BalanceCoinRow {...renderItemProps} />;
const filterEmptyAssetSections = sections => sections.filter(({ totalItems }) => totalItems);

const WalletScreen = ({
  accountAddress,
  accountUpdateAccountAddress,
  assets,
  assetsCount,
  assetsTotalUSD,
  fetching,
  onPressProfile,
  onPressWalletConnect,
  onToggleShowShitcoins,
  showShitcoins,
  uniqueTokens,
}) => {
  const sections = {
    balances: {
      data: sortAssetsByNativeAmount(assets, showShitcoins),
      renderItem: BalanceRenderItem,
      title: lang.t('account.tab_balances'),
      totalItems: get(assetsTotalUSD, 'amount') ? assetsCount : 0,
      totalValue: get(assetsTotalUSD, 'display', ''),
    },
    collectibles: {
      data: buildUniqueTokenList(uniqueTokens),
      renderItem: UniqueTokenRow,
      title: lang.t('account.tab_collectibles'),
      totalItems: uniqueTokens.length,
      totalValue: '',
    },
  };

  const assetsByMarketValue = groupAssetsByMarketValue(assets);
  const totalShitcoins = get(assetsByMarketValue, 'noValue', []).length;
  if (totalShitcoins) {
    sections.balances.contextMenuOptions = {
      cancelButtonIndex: 1,
      destructiveButtonIndex: showShitcoins ? 0 : 99, // 99 is an arbitrarily high number used to disable the 'destructiveButton' option
      onPress: onToggleShowShitcoins,
      options: [
        `${showShitcoins ? lang.t('account.hide') : lang.t('account.show')} ${lang.t('wallet.assets.no_price')}`,
        lang.t('wallet.action.cancel'),
      ],
    };
  }

  return (
    <Page component={FlexItem} style={position.sizeAsObject('100%')}>
      <Header justify="space-between">
        <HeaderButton onPress={onPressProfile}>
          <Avatar />
        </HeaderButton>
        <ActivityHeaderButton />
      </Header>
      <AssetList
        onPressWalletConnect={onPressWalletConnect}
        fetchData={() => {
          // note: every time this is called it sets a new interval. this is a memory leak.
          accountUpdateAccountAddress(accountAddress, 'BALANCEWALLET');
          return new Promise((resolve) => {
            // hack: use timeout so that it looks like loading is happening
            // accountUpdateAccountAddress does not return a promise
            setTimeout(resolve, 2000);
          });
        }}
        sections={filterEmptyAssetSections([sections.balances, sections.collectibles])}
        showShitcoins={showShitcoins}
      />
    </Page>
  );
};

WalletScreen.propTypes = {
  accountAddress: PropTypes.string,
  accountUpdateAccountAddress: PropTypes.func.isRequired,
  assets: PropTypes.array,
  assetsCount: PropTypes.number,
  assetsTotalUSD: PropTypes.shape({
    amount: PropTypes.string,
    display: PropTypes.string,
  }),
  fetching: PropTypes.bool.isRequired,
  fetchingUniqueTokens: PropTypes.bool.isRequired,
  onPressProfile: PropTypes.func.isRequired,
  onPressWalletConnect: PropTypes.func.isRequired,
  onToggleShowShitcoins: PropTypes.func,
  showShitcoins: PropTypes.bool,
  uniqueTokens: PropTypes.array.isRequired,
};

export default compose(
  withAccountAddress,
  withAccountAssets,
  withHideSplashScreenOnMount,
  withState('showShitcoins', 'toggleShowShitcoins', true),
  withHandlers({
    onPressProfile: ({ navigation }) => () => navigation.navigate('SettingsScreen'),
    onPressWalletConnect: ({ navigation }) => () => navigation.navigate('QRScannerScreen'),
    onToggleShowShitcoins: ({ showShitcoins, toggleShowShitcoins }) => (index) => {
      if (index === 0) {
        toggleShowShitcoins(!showShitcoins);
      }
    },
  }),
  onlyUpdateForKeys(['isScreenActive', ...Object.keys(WalletScreen.propTypes)]),
)(WalletScreen);
