#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;

    // upper half: rows 1 to n
    for(int row=1;row<=n;row++){
        for(int star=1;star<=row;star++){
            cout<<"*";
        }
        for(int space=1;space<=2*(n-row);space++){
            cout<<" ";
        }
        for(int star=1;star<=row;star++){
            cout<<"*";
        }
        cout<<endl;
    }

    // lower half: rows n-1 down to 1
    for(int row=n-1;row>=1;row--){
        for(int star=1;star<=row;star++){
            cout<<"*";
        }
        for(int space=1;space<=2*(n-row);space++){
            cout<<" ";
        }
        for(int star=1;star<=row;star++){
            cout<<"*";
        }
        cout<<endl;
    }
    return 0;
}