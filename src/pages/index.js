import React from 'react'
import { graphql, StaticQuery } from 'gatsby'
import styled from 'react-emotion'
import { MdAdd } from 'react-icons/md'
import { Link as GatsbyLink } from 'gatsby'
import idx from 'idx'

import FloatingButton from '../components/floating-button'
import MessageList from '../components/message-list'
import Spinner from '../components/spinner'

import getZIndex from '../style/z-index'

const Container = styled.div({
  zIndex: getZIndex('button'),
})

const BottomRight = styled.div({
  position: 'fixed',
  bottom: 24,
  right: 16,
})

const createdDateOf = obj =>
  new Date(1000 * parseInt(obj.id.substring(0, 8), 16))

const IndexPage = () => (
  <StaticQuery
    query={graphql`
      {
        oneGraph {
          trello {
            list(id: "5b7339d8e5ffe57a1874afb4") {
              cards {
                nodes {
                  id
                  name
                  desc
                  url
                  actions {
                    nodes {
                      type
                      date
                      data {
                        listBefore {
                          id
                          name
                        }
                        listAfter {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `}
    render={data => {
      const groupedCards = idx(data, _ => _.oneGraph.trello.list.cards.nodes)
        .map(card => {
          // action describing when the card was moved to the observation list
          const observation = card.actions.nodes.find(
            action => action.data.listAfter.id === '5b7339d8e5ffe57a1874afb4'
          )
          const date = new Date(observation.date)
          const groupId = `${date.getYear()}${date.getMonth()}${date.getDay()}`

          return {
            ...card,
            groupId,
            completedAt: date.toLocaleString(),
            createdAt: createdDateOf(card).toLocaleString(),
          }
        })
        .reduce((table, card) => {
          return {
            ...table,
            [card.groupId]: [...(table[card.groupId] || []), card]
              .concat()
              .sort((a, b) => a.date - b.date),
          }
        }, {})
      console.log(groupedCards)
      return (
        <Container>
          {Object.entries(groupedCards)
            .concat()
            .sort((a, b) => a.groupId - b.groupId)
            .map(([groupId, cards]) => (
              <div key={groupId}>
                <h1>{groupId}</h1>
                {cards.map(card => (
                  <React.Fragment key={card.id}>
                    <Title>
                      {card.name}{' '}
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ⤴
                      </a>
                    </Title>
                    Created on: {card.createdAt}
                    Observed on: {card.completedAt}
                    <Space />
                  </React.Fragment>
                ))}
              </div>
            ))}
        </Container>
      )
    }}
  />
)

const Title = styled.h3({
  margin: 0,
})

const Space = styled.div({
  height: '1.5rem',
})

export default IndexPage
