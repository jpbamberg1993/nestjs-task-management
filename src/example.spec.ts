class FriendsList {
  friends = [];

  addFriend(name: string): void {
    this.friends.push(name);
    this.announceFriendship(name);
  }

  announceFriendship(name: string): void {
    console.log(`${name} is now a friend!`);
  }

  removeFriend(name: string): void {
    const friendIndex = this.friends.indexOf(name);
    if (friendIndex === -1) {
      throw new Error('That friend does not exist.');
    }
    this.friends.splice(friendIndex, 1);
  }
}

describe('FriendsList', () => {
  let friendsList: FriendsList;

  beforeEach(() => {
    friendsList = new FriendsList();
  });

  it('initializes friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  it('adds friend to list', () => {
    friendsList.addFriend('jesse');
    expect(friendsList.friends.length).toEqual(1);
  });

  it('announces friendship', () => {
    friendsList.announceFriendship = jest.fn();
    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('jesse');
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('jesse');
  });

  describe('removeFriend', () => {
    it('removes friend from list', () => {
      friendsList.addFriend('tj');
      friendsList.addFriend('ken');
      friendsList.addFriend('jess');
      friendsList.removeFriend('ken');
      expect(friendsList.friends.length).toEqual(2);
      expect(friendsList.friends.find(friend => friend === 'ken')).toBeUndefined();
    });

    it('throws error if friend does not exist', () => {
      expect(() => friendsList.removeFriend('ken')).toThrowError(Error);
    });
  });
});