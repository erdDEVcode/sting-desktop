import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import { useResult } from '../../hooks'
import { AllowedDapp, Storage } from '../../types/all'
import Modal from '../Modal'
import TextInput from '../TextInput'
import LoadingIcon from '../LoadingIcon'
import IconButton from '../IconButton'
import ErrorBox from '../ErrorBox'

const StyledModal = styled(Modal)`
  background-color: ${(p: any) => p.theme.aboutModal.bgColor};
  color: ${(p: any) => p.theme.aboutModal.textColor};
`

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'flex-start', align: 'center' })};
  padding: 2rem 1rem;

  h2 {
    margin: 0;
  }
`

const StyledErrorBox = styled(ErrorBox)`
  width: 80%;
  margin: 1rem 0;
`

const Div = styled.div`
  align-self: stretch;
  width: 100%;
  padding-bottom: 1rem;
`

const Intro = styled.p`
  font-size: 0.8rem;
  margin: 1rem 0 2rem;
  text-align: center;
`

const NoneYet = styled.div`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  font-size: 1.2rem;
  text-align: center;
`

const Table = styled.div`
  ${flex({ direction: 'column', justify: 'flex-start', align: 'stretch', basis: 1 })};
  width: 80%;
  margin: 0 auto;
`

const FilterInput = styled(TextInput)`
  margin-bottom: 1rem;
  flex: 0;
`

const Rows = styled.div`
  ${flex({ direction: 'column', justify: 'flex-start', align: 'stretch', basis: 1 })};
  flex: 1;
  max-height: 350px;
  overflow: scroll;
`

const ItemDiv = styled.div`
  ${flex({ direction: 'row', justify: 'space-between', align: 'center' })};
  ${(p: any) => p.theme.font('body', 'normal')};
  font-size: 1.3rem;
  padding: 1rem;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid ${(p: any) => p.theme.browser.configModal.allowedDapps.item.hover.borderColor};
  }

  button {
    font-size: 50%;
    margin-left: 1rem;
  }
`

const DappInfo = styled.div`
  word-break: break-all;
  line-height: 1.1em;
`
const DappTitle = styled.p``
const DappId = styled.p`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  font-size: 70%;
  margin-top: 0.5rem;
`

interface ConfigItemProps {
  onRemove: (id: string) => void,
}

const ConfigItem: React.FunctionComponent<ConfigItemProps> = ({ children, onRemove }) => {
  const dapp = (children as AllowedDapp)

  const remove = useCallback(() => {
    onRemove(dapp.id)
  }, [ onRemove, dapp ])

  return (
    <ItemDiv>
      <DappInfo>
        <DappTitle>{dapp.title}</DappTitle>
        <DappId>{dapp.id}</DappId>
      </DappInfo>
      <IconButton icon='remove' tooltip='Remove' onClick={remove} />
    </ItemDiv>
  )
}

interface ConfigProps {
  onRequestClose: () => void,
  isOpen: boolean,
  storage: Storage,
}

const ConfigModal: React.FunctionComponent<ConfigProps> = ({ isOpen, onRequestClose, storage }) => {
  const [ list, error, setList, setError ] = useResult<any>()
  const [ filter, setFilter ] = useState('')

  const filteredList = useMemo(() => {
    return list ? list.filter((dapp: AllowedDapp) => {
      const cmp = `${dapp.id} ${dapp.title}`.toLowerCase()
      return 0 <= cmp.indexOf(filter.toLowerCase())
    }) : []
  }, [ list, filter ])

  const removeItemFromList = useCallback(async (id: string) => {
    storage.disallowDapp({ id })
      .then(() => {
        setList(list.filter((d: AllowedDapp) => (d.id !== id))) 
      })
      .catch(setError)
  }, [list, setError, setList, storage])

  useEffect(() => {
    storage.getAllowedDapps()
      .then(setList)
      .catch(setError)
  }, [setError, setList, storage, isOpen])

  return (
    <StyledModal isOpen={isOpen} width='640px' height='600px' onRequestClose={onRequestClose}>
      <Container>
        <h2>Allowed dapps</h2>
        {error ? (
          <StyledErrorBox>{error}</StyledErrorBox>
        ) : null}
        {list ? (
          <Div>
            <Intro>You have allowed these dapps to see your wallet</Intro>
            {list.length ? (
              <Table>
                <FilterInput value={filter} onChange={setFilter} placeholder='Filter...' />
                <Rows>
                  {filteredList.map((dapp: AllowedDapp) => (
                    <ConfigItem key={dapp.id} onRemove={removeItemFromList}>{dapp}</ConfigItem>
                  ))}
                </Rows>
              </Table>
            ) : (
              <NoneYet>None yet!</NoneYet>
            )}
          </Div>
        ) : <LoadingIcon />}
      </Container>
    </StyledModal>
  )
}

export default ConfigModal
