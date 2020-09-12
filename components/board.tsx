import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Top from './top';
import Column from './column';
import AddSection from './add-section';
import { v4 as uuidv4 } from 'uuid';
import CardModal from './card-modal';

function Board(props: any) {
  const [state, setState] = useState({
    columns: {
      'column-0': {
        id: 'column-0',
        title: 'Plan',
        cards: [
          {
            id: uuidv4(),
            cardTitle: 'Create HTML skeleton',
            note: '',
            checklists: [],
            activities: [],
            dueDate: new Date(2020, 9, 11),
            createdAt: new Date(2020, 8, 11),
            updatedAt: new Date(2020, 8, 11),
          },
        ],
        colorIndex: 0,
        createdAt: new Date(2020, 8, 1),
        updatedAt: new Date(2020, 8, 11),
      },
      'column-1': {
        id: 'column-1',
        title: 'Progress',
        cards: [],
        colorIndex: 1,
        createdAt: new Date(2020, 8, 2),
        updatedAt: new Date(2020, 8, 2),
      },
      'column-2': {
        id: 'column-2',
        title: 'Complete',
        cards: [],
        colorIndex: 2,
        createdAt: new Date(2020, 8, 3),
        updatedAt: new Date(2020, 8, 3),
      },
    },
    columnOrder: ['column-0', 'column-1', 'column-2'],
  } as any);

  const [colorIndex, setColorIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState({} as any);
  const [currentColumn, setCurrentColumn] = useState({} as any);

  useEffect(() => {
    setColorIndex(state.columnOrder.length - 1);
  }, []);

  const addSection = (sectionTitle: any) => {
    const newSection = {
      id: uuidv4(),
      title: sectionTitle,
      cards: [],
      colorIndex: colorIndex + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setColorIndex(colorIndex + 1);
    state.columns[newSection.id] = newSection;
    state.columnOrder.push(newSection.id);
    setState({
      ...state,
    } as any);
  };

  const addCard = (columnId: any, cardTitle: any) => {
    const newCard = {
      id: uuidv4(),
      cardTitle,
      note: '',
      checklists: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addActivity(columnId, newCard.id, 'This card is created');
    updateDate(columnId, null);
    state.columns[columnId].cards.push(newCard);
    setState({
      ...state,
    } as any);
  };

  const updateSectionTitle = (columnId: any, sectionTitle: any) => {
    state.columns[columnId].title = sectionTitle;
    state.columns[columnId].updatedAt = new Date();
    setState({
      ...state,
    } as any);
  };

  const updateCardTitle = (columnId: any, cardId: any, cardTitle: any) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.cardTitle = cardTitle;
      }
    });
    updateDate(columnId, cardId);
    addActivity(columnId, cardId, `Card title is changed to ${cardTitle}`);
    setState({
      ...state,
    } as any);
  };

  const updateCardNote = (columnId: any, cardId: any, note: any) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.note = note;
      }
    });
    updateDate(columnId, cardId);
    addActivity(columnId, cardId, `Card note is changed to ||${note}`);
    setState({
      ...state,
    } as any);
  };

  const deleteColumn = (id: any) => {
    delete state.columns[id];
    state.columnOrder.splice(state.columnOrder.indexOf(id), 1);
    setState({
      ...state,
    } as any);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    if (result.type === 'column') {
      const columnOrder = reorder(
        state.columnOrder,
        result.source.index,
        result.destination.index
      );
      setState({
        ...state,
        columnOrder,
      } as any);
      return;
    }

    if (result.source.droppableId === result.destination.droppableId) {
      const column = state.columns[result.source.droppableId];
      const cards = reorder(
        column.cards,
        result.source.index,
        result.destination.index
      );

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            cards,
          },
        },
      };
      setState(newState);
      return;
    }

    const sourceColumn = state.columns[result.source.droppableId];
    const destinationColumn = state.columns[result.destination.droppableId];
    const card = sourceColumn.cards[result.source.index];

    const newSourceColumn = {
      ...sourceColumn,
      cards: [...sourceColumn.cards],
    };
    newSourceColumn.cards.splice(result.source.index, 1);

    const newDestinationColumn = {
      ...destinationColumn,
      cards: [...destinationColumn.cards],
    };
    newDestinationColumn.cards.splice(result.destination.index, 0, card);

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    };

    setState(newState);
  };

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    display: 'flex',
    flexDirection: 'row',
    ...draggableStyle,
  });

  const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  //for modal
  const [open, setOpen] = React.useState(false);

  const setCardForOpen = (columnId: any, cardId: any) => {
    const card = state.columns[columnId].cards.filter(
      (card: any) => card.id === cardId
    );
    setCurrentCard(card[0]);
    setCurrentColumn(state.columns[columnId]);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const addChecklist = (columnId: any, cardId: any, checklist: any) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.checklists.push({
          id: uuidv4(),
          checklist,
          isChecked: false,
          date: new Date(),
        });
      }
    });
    addActivity(columnId, cardId, `${checklist} is added to the checklist`);
    updateDate(columnId, cardId);
    setState({
      ...state,
    } as any);
  };

  const updateDate = (columnId: any, cardId: any) => {
    if (cardId) {
      state.columns[columnId].cards.map((card: any) => {
        if (card.id === cardId) {
          card.updatedAt = new Date();
        }
      });
    }
    state.columns[columnId].updatedAt = new Date();
    setState({
      ...state,
    } as any);
  };

  const updateChecklist = (
    columnId: any,
    cardId: any,
    checklistId: any,
    checklistContent: any
  ) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.checklists.map((checklist: any) => {
          if (checklist.id === checklistId) {
            checklist.checklist = checklistContent;
          }
        });
      }
    });
    updateDate(columnId, cardId);
    addActivity(
      columnId,
      cardId,
      `A checklist is updated to ${checklistContent}`
    );
    setState({
      ...state,
    } as any);
  };

  const completeChecklist = (
    columnId: any,
    cardId: any,
    checklistId: any,
    isChecked: any
  ) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.checklists.map((checklist: any) => {
          if (checklist.id === checklistId) {
            checklist.isChecked = isChecked;
          }
        });
      }
    });
    updateDate(columnId, cardId);
    if (isChecked) addActivity(columnId, cardId, `A checklist is completed`);
    else addActivity(columnId, cardId, `A checklist is changed to incomplete`);
    setState({
      ...state,
    } as any);
  };

  const deleteChecklist = (columnId: any, cardId: any, checklistId: any) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.checklists = card.checklists.filter(
          (checklist: any) => checklist.id !== checklistId
        );
      }
    });
    updateDate(columnId, cardId);
    addActivity(columnId, cardId, `A checklist is deleted`);
    setState({
      ...state,
    } as any);
  };

  const addActivity = (columnId: any, cardId: any, activity: any) => {
    state.columns[columnId].cards.map((card: any) => {
      if (card.id === cardId) {
        card.activities.unshift({
          id: uuidv4(),
          activity,
          createdAt: new Date(),
        });
      }
    });
    setState({
      ...state,
    } as any);
  };

  return (
    <>
      <Top
        setView={props.setView}
        setProjectName={props.setProjectName}
        projectName={props.projectName}
      />
      <div className="board">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            direction="horizontal"
            droppableId="all-droppables"
            type="column"
          >
            {(provided: any, snapshot: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.droppableProps.style
                )}
              >
                {state.columnOrder.map((columnId: any, index: any) => {
                  return (
                    <Column
                      key={columnId}
                      column={state.columns[columnId]}
                      index={index}
                      reorder={reorder}
                      addCard={addCard}
                      setOpen={setOpen}
                      setCardForOpen={setCardForOpen}
                      updateSectionTitle={updateSectionTitle}
                      deleteColumn={deleteColumn}
                      onDragEnd={onDragEnd}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <AddSection colorIndex={colorIndex} addSection={addSection} />
      </div>
      {open && (
        <CardModal
          open={true}
          projectName={props.projectName}
          currentColumn={currentColumn}
          handleModalClose={handleModalClose}
          currentCard={currentCard}
          addChecklist={addChecklist}
          updateChecklist={updateChecklist}
          addActivity={addActivity}
          updateCardTitle={updateCardTitle}
          updateCardNote={updateCardNote}
          completeChecklist={completeChecklist}
          deleteChecklist={deleteChecklist}
        />
      )}
    </>
  );
}
export default Board;
