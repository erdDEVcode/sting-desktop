import React, { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import { flex, boxShadow } from 'emotion-styled-utils'

import Address from './Address'
import { GlobalConsumer, GlobalContextValue } from '../contexts'
import Icon from './Icon'
import Button from './Button'
import CopyToClipboardButton from './CopyToClipboardButton'
import HeaderClickable from './HeaderClickable'

const Container = styled.div`
  position: relative;
`

const TextSpan = styled(HeaderClickable)`
  cursor: pointer;
`

const StyledIcon = styled(Icon)`
  color: ${(p: any) => p.theme.accountState.icon.color};
  margin-right: 0.5em;
`

const ArrowIcon = styled(Icon)`
  color: transparent;
  margin-left: 0.5em;
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0);
`

const Menu = styled.ul`
  display: block;
  position: absolute;
  top: 2rem;
  left: 0;
  width: 400px;
  ${(p: any) => boxShadow({ color: p.theme.accountState.menu.shadowColor })};
  border-radius: 10px;
`

const itemNormalStyles= (p: any) => `
  background-color: ${p.theme.accountState.menu.item.bgColor};
  color: ${p.theme.accountState.menu.item.textColor};
`

const itemSelectedStyles = (p: any) => `
  background-color: ${p.theme.accountState.menu.item.selected.bgColor};
  color: ${p.theme.accountState.menu.item.selected.textColor};
`

const MenuItem = styled.li`
  ${flex({ direction: 'row', justify: 'space-between', align: 'center' })};
  ${(p: any) => p.theme.font('header')};
  ${(p: any) => p.active ? itemSelectedStyles(p) : itemNormalStyles(p)};
  border-bottom: 1px solid ${(p: any) => p.theme.accountState.menu.item.borderColor};
  font-size: 1rem;
  padding: 1em;

  &:last-of-type {
    border-bottom: none;
  }
`

const ItemAddress = styled(Address)`
  cursor: pointer;
  font-size: 80%;
  word-break: break-all;
  line-height: 1.2em;
  margin-right: 1rem;
`


const AddAccountButton = styled(Button)`
  padding: 0.4em 0.8em;
  font-size: 80%;
`

interface Props {
  className?: string,
  addNewWallet: () => void,
}

const AccountStatus: React.FunctionComponent<Props> = ({ className, addNewWallet }) => {
  const [ showMenu, setShowMenu ] = useState(false)

  const toggleAccountMenu = useCallback(() => {
    setShowMenu(!showMenu)
  }, [ showMenu ])

  const showAddModal = useCallback(() => {
    setShowMenu(false)
    addNewWallet()
  }, [ addNewWallet ])

  const switchToAccount = useCallback((setActiveAccount: Function, a: any) => {
    setActiveAccount(a)
    setTimeout(toggleAccountMenu, 100)
  }, [ toggleAccountMenu ])

  return (
    <GlobalConsumer>
      {({ accounts, activeAccount, setActiveAccount }: GlobalContextValue) => (
        activeAccount ? (
          <Container className={className}>
            <TextSpan onClick={toggleAccountMenu}>
              <StyledIcon name='user' />
              <Address address={activeAccount.address()} shorten={true} />
              <ArrowIcon name='downChevron' />
            </TextSpan>
            {showMenu ? (
              <React.Fragment>
                <Overlay onClick={toggleAccountMenu} />
                <Menu>
                  {accounts.map(a => (
                    <MenuItem
                      key={a.address()}
                      active={a.address() === activeAccount.address()}
                    >
                      <ItemAddress address={a.address()} onClick={() => switchToAccount(setActiveAccount, a)} />
                      <CopyToClipboardButton value={a.address()} />
                    </MenuItem>
                  ))}
                  <MenuItem key='add'>
                    <AddAccountButton onClick={showAddModal}>Add account</AddAccountButton>
                  </MenuItem>
                </Menu>
              </React.Fragment>
            ) : null}
          </Container>
        ) : null
      )}
    </GlobalConsumer>
  )
}

export default AccountStatus

