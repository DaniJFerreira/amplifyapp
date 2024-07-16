// import logo from './logo.svg';
import './App.css';
import "@aws-amplify/ui-react/styles.css"
import { generateClient } from 'aws-amplify/api';
import {  getUrl, uploadData, remove } from 'aws-amplify/storage';

import {
  withAuthenticator,
  Flex,
  Text,
  TextField,
  Button,
  Heading,
  Image,
  View,
  // Card
} from "@aws-amplify/ui-react";
// import { signOut } from 'aws-amplify/auth';
import { listNotes } from './graphql/queries';
import {  
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation
} from './graphql/mutations';
// import { signOut } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

const client = generateClient();

const App = ({signOut}) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

async function fetchNotes() {
  const apiData = await client.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
    notesFromAPI.map(async(note) => {
      if(note.image) {
        const url = await getUrl({key: note.id});
        note.image = url;
      }
      return note;
    })
  );
  setNotes(notesFromAPI);
}

async function createNote(event) {
   event.preventDefault();
   const from = new FormData(event.target);
   const image = from.get("image");
   const data = {
    name: from.get("name"),
    description: from.get("description"),
    image: image.name,
   };
   const result = await client.graphql({
    query: createNoteMutation,
    variables: { input: data },
   });
   if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
   fetchNotes();
   event.target.reset();
}

async function deleteNote({ id, name }) {
  const newNotes = notes.filter((note) => note.id !== id );
  setNotes(newNotes);
  await remove({key: id});
  await client.graphql({
    query: deleteNoteMutation,
    variables: { input: { id } },
  });
}
  return (
   <View className='App'>
      {/* <Card>
        <Image src={logo} className='App-logo' alt='logo'/>
        <Heading level={1}>We now have Auth!</Heading>
      </Card> */} 
     <Heading level={1}>My Notes App</Heading>
      <View as='form' margin='3rem 0' onSubmit={createNote}>
        <Flex direction='row' justifyContent="center">
          <TextField 
            name='name'
            placeholder='Note name'
            label='Note name'
            labelHidden
            variation='quiet'
            required
          />
          <TextField 
             name='description'
             placeholder='Note description'
             label='Note description'
             labelHidden
             variation='quiet'
             required
          />
          <View 
             name='image'
             as='input'
             type='file'
             style={{ alignSelf: 'end'}}
          />  
           <Button type='submit' variation='primary'>create Note</Button>
        </Flex>
      </View>
    <Heading level={2}>Current Notes</Heading>
    <View margin='3rem 0'>
      {notes.map((note) => (
        <Flex 
          key={notes.id || notes.name}
          direction='row'
          justifyContent='center'
          alignItems='center' 
        >
          {note.image && (
          <Image 
            src={note.image.url.href}
            alt={`visual aid for ${notes.name}`}
            style={{ width: 400 }}
          />
        )}
        <Text as='strong' fontWeight={700}>
          {note.name}
        </Text>
        <Text as='span'>
          {note.description}
        </Text>
        <Button variation='link' onClick={() => deleteNote(note)}>
          Delete Note
        </Button>
        </Flex>
      ))}
     </View>
     <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);

// import './App.css';
// import "@aws-amplify/ui-react/styles.css";
// import { generateClient } from 'aws-amplify/api';
// // import { Amplify, Storage } from 'aws-amplify';  // Correctly importing Storage from aws-amplify
// import { getUrl, uploadData, remove } from 'aws-amplify/storage';
// import {
//   withAuthenticator,
//   Flex,
//   Text,
//   TextField,
//   Button,
//   Heading,
//   Image,
//   View,
// } from "@aws-amplify/ui-react";
// import { listNotes } from './graphql/queries';
// import {
//   createNote as createNoteMutation,
//   deleteNote as deleteNoteMutation
// } from './graphql/mutations';
// import { useEffect, useState } from 'react';

// const client = generateClient();

// const App = ({ signOut }) => {
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     fetchNotes();
//   }, []);

//   async function fetchNotes() {
//     const apiData = await client.graphql({ query: listNotes });
//     const notesFromAPI = apiData.data.listNotes.items;
//     await Promise.all(
//       notesFromAPI.map(async (note) => {
//         if (note.image) {
//           const url = await getUrl({ key: note.id});
//           note.image = url;
//         }
//         return note;
//       })
//     );
//     setNotes(notesFromAPI);
//   }

//   async function createNote(event) {
//     event.preventDefault();
//     const form = new FormData(event.target);
//     const image = form.get("image");
//     const data = {
//       name: form.get("name"),
//       description: form.get("description"),
//       image: image ? image.name : undefined,  // Condition to handle optional image
//     };
//     if (data.image) await uploadData(data.name, image)
//     await client.graphql({
//       query: createNoteMutation,
//       variables: { input: data },
//     });
//     fetchNotes();
//     event.target.reset();
//   }

//   async function deleteNote({ id, name }) {
//     const newNotes = notes.filter((note) => note.id !== id);
//     setNotes(newNotes);
//     await remove({ key: name});
//     await client.graphql({
//       query: deleteNoteMutation,
//       variables: { input: { id } },
//     });
//   }

//   return (
//     <View className='App'>
//       <Heading level={1}>My Notes App</Heading>
//       <View as='form' margin='3rem 0' onSubmit={createNote}>
//         <Flex direction='row' justifyContent="center">
//           <TextField
//             name='name'
//             placeholder='Note name'
//             label='Note name'
//             labelHidden
//             variation='quiet'
//             required
//           />
//           <TextField
//             name='description'
//             placeholder='Note description'
//             label='Note description'
//             labelHidden
//             variation='quiet'
//             required
//           />
//           <View
//             key={notes.image}
//             name='image'
//             as='input'
//             type='file'
//             style={{ alignSelf: 'end' }}
//           />
//           <Button type='submit' variation='primary'>Create Note</Button>
//         </Flex>
//       </View>
//       <Heading level={2}>Current Notes</Heading>
//       <View margin='3rem 0'>
//         {notes.map((note) => (
//           <Flex
//             key={note.id || note.name}
//             direction='row'
//             justifyContent='center'
//             alignItems='center'
//           >
//             <Text as='strong' fontWeight={700}>
//               {note.name}
//             </Text>
//             <Text as='span'>
//               {note.description}
//             </Text>
//             {note.image && (
//               <Image
//                 src={note.image}
//                 alt={`visual aid for ${note.name}`}
//                 style={{ width: 400 }}
//               />  
//             )}
//             <Button variation='link' onClick={() => deleteNote(note)}>
//               Delete Note
//             </Button>
//           </Flex>
//         ))}
//       </View>
//       <Button onClick={signOut}>Sign Out</Button>
//     </View>
//   );
// }

// export default withAuthenticator(App);

